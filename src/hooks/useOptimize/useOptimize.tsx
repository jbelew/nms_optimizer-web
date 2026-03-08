import type { ApiResponse, Grid } from "../../store/GridStore";
import { useEffect, useRef, useState } from "react";

import { createEmptyCell, useGridStore } from "../../store/GridStore";
import { useOptimizeStore } from "../../store/OptimizeStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechStore } from "../../store/TechStore";
import { Logger } from "../../utils/logger";
import { createSocket, TRANSPORT_ERROR_MESSAGES } from "../../utils/socketManager";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";
import { useScrollGridIntoView } from "../useScrollGridIntoView/useScrollGridIntoView";

/**
 * The return type of the `useOptimize` hook.
 */
export interface UseOptimizeReturn {
	/** Whether an optimization is currently in progress. */
	solving: boolean;
	/** The current progress percentage (0-100). */
	progressPercent: number;
	/** Function to initiate optimization for a specific technology. */
	handleOptimize: (tech: string, forced?: boolean) => Promise<void>;
	/** Ref to the grid container for automated scrolling. */
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	/** The technology identifier that failed to fit using pattern solving, if any. */
	patternNoFitTech: string | null;
	/** Function to clear the "No Fit" warning state. */
	clearPatternNoFitTech: () => void;
	/** Function to re-run optimization with forced solving for the current PNF tech. */
	handleForceCurrentPnfOptimize: () => Promise<void>;
}

/**
 * Type guard for validating that a value conforms to the `ApiResponse` structure.
 *
 * @param {unknown} value - The object to validate.
 * @returns {value is ApiResponse} `true` if valid, otherwise `false`.
 */
function isApiResponse(value: unknown): value is ApiResponse {
	if (typeof value !== "object" || value === null) return false;
	const obj = value as Record<string, unknown>;
	if (typeof obj.solve_method !== "string") return false;

	if (obj.grid !== null) {
		if (typeof obj.grid !== "object" || !obj.grid) return false;
		const gridCandidate = obj.grid as Record<string, unknown>;
		if (!Array.isArray(gridCandidate.cells) || typeof gridCandidate.width !== "number")
			return false;
	}

	if ("max_bonus" in obj && typeof obj.max_bonus !== "number") return false;
	if ("solved_bonus" in obj && typeof obj.solved_bonus !== "number") return false;

	return true;
}

/**
 * Custom hook for managing the asynchronous optimization process via WebSockets.
 *
 * This hook handles the entire lifecycle of an optimization request:
 * 1. Establishing a WebSocket connection via `socket.io-client`.
 * 2. Managing progress updates and real-time grid updates.
 * 3. Handling success, "No Fit" warnings, and transport-level retries.
 * 4. Cleaning up resources and updating the global `GridStore`.
 *
 * **Requires a running backend service supporting Socket.io.**
 *
 * @returns {UseOptimizeReturn} State and functions to control the optimization workflow.
 *
 * @example
 * const { handleOptimize, solving } = useOptimize();
 */
export const useOptimize = (): UseOptimizeReturn => {
	const setShowErrorStore = useOptimizeStore((s) => s.setShowError);
	const setPatternNoFitTech = useOptimizeStore((s) => s.setPatternNoFitTech);
	const patternNoFitTech = useOptimizeStore((s) => s.patternNoFitTech);
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const { sendEvent } = useAnalytics();
	const isLarge = useBreakpoint("1024px");

	const [solving, setSolving] = useState(false);
	const [progressPercent, setProgressPercent] = useState(0);
	const isOptimizingRef = useRef(false);
	const cleanupRef = useRef<(() => void) | null>(null);
	const isMountedRef = useRef(true);
	/** Stable ref to the latest handleOptimize; used internally for retry recursion. */
	const handleOptimizeRef = useRef<
		((tech: string, forced?: boolean, retryCount?: number) => Promise<void>) | undefined
	>(undefined);
	const scrollOptions = { skipOnLargeScreens: true };
	const { gridContainerRef, scrollIntoView } = useScrollGridIntoView(scrollOptions);

	const resetProgress = () => {
		if (!isMountedRef.current) return;
		setSolving(false);
		isOptimizingRef.current = false;
		setProgressPercent(0);
	};

	// Reset mount state on unmount
	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;

			if (cleanupRef.current) {
				cleanupRef.current();
				cleanupRef.current = null;
			}
		};
	}, []);

	// Scroll into view when solving on smaller screens
	useEffect(() => {
		if (solving && isMountedRef.current) {
			scrollIntoView();
		}
	}, [solving, scrollIntoView]);

	/** Maximum number of silent transport-error retries before showing the error modal. */
	const MAX_TRANSPORT_RETRIES = 2;

	/**
	 * Initiates the optimization solve for the specified technology.
	 *
	 * @param {string} tech - The internal identifier for the technology (e.g., 'pulse').
	 * @param {boolean} [forced=false] - If `true`, bypasses pattern matching and uses advanced solvers immediately.
	 * @param {number} [retryCount=0] - Internal counter for handling network retries.
	 */
	const handleOptimize = async (
		tech: string,
		forced: boolean = false,
		retryCount: number = 0
	) => {
		if (isOptimizingRef.current && retryCount === 0) {
			Logger.warn("Optimization already in progress, ignoring request");

			return;
		}

		const { grid, setGrid, setResult } = useGridStore.getState();
		const { checkedModules, techGroups, activeGroups } = useTechStore.getState();

		isOptimizingRef.current = true;
		setSolving(true);
		setProgressPercent(0);
		setShowErrorStore(false);

		if (forced || patternNoFitTech === tech) setPatternNoFitTech(null);

		Logger.info(`Optimization started for ${tech}`, {
			tech,
			forced,
			platform: selectedShipType,
		});

		const updatedGrid: Grid = {
			...grid,
			cells: grid.cells.map((row) => {
				let rowChanged = false;
				const newRow = row.map((cell) => {
					if (cell.tech === tech) {
						rowChanged = true;

						return { ...createEmptyCell(cell.supercharged, cell.active) };
					}

					return cell;
				});

				return rowChanged ? newRow : row;
			}),
		};

		const socket = createSocket();

		if (!socket) {
			const error = new Error("Failed to initialize WebSocket connection");
			Logger.error(`Optimization failed for ${tech}: Socket initialization error`, error);
			setShowErrorStore(true, "recoverable", error);
			resetProgress();

			return;
		}

		const cleanup = () => {
			socket.off("progress", onProgress);
			socket.off("optimization_result", onResult);
			socket.off("connect_error", onError);
			socket.off("error", onError);
			socket.off("disconnect", onDisconnect);
			socket.disconnect(); // Always disconnect on cleanup
			cleanupRef.current = null;
			resetProgress();
		};

		cleanupRef.current = cleanup;

		const onProgress = (data: {
			progress_percent: number;
			best_grid?: Grid;
			status?: string;
		}) => {
			if (!isMountedRef.current) return;
			setProgressPercent(data.progress_percent);

			if (data.best_grid) {
				setGrid(data.best_grid);
			}
		};

		const onResult = (data: unknown) => {
			if (!isMountedRef.current) {
				cleanup();

				return;
			}

			if (isApiResponse(data)) {
				if (data.solve_method === "Pattern No Fit" && !forced) {
					Logger.info(`Optimization "Pattern No Fit" for ${tech}`, {
						tech,
						platform: selectedShipType,
					});
					setPatternNoFitTech(tech);
					sendEvent({
						category: "ui",
						action: "no_fit_warning",
						platform: selectedShipType,
						tech,
						value: 1,
						nonInteraction: false,
					});
				} else {
					if (patternNoFitTech === tech) setPatternNoFitTech(null);

					Logger.info(`Optimization complete for ${tech}`, {
						tech,
						method: data.solve_method,
						bonus: data.max_bonus,
					});

					setResult(data, tech);
					const gaTech =
						tech === "pulse" && checkedModules[tech]?.includes("PC")
							? "photonix"
							: tech;

					if (data.grid) {
						sendEvent({
							category: "ui",
							action: "optimize_tech",
							platform: selectedShipType,
							tech: gaTech,
							solve_method: data.solve_method,
							value: 1,
							nonInteraction: false,
							supercharged:
								typeof data.max_bonus === "number" && data.max_bonus > 100,
						});
						setGrid(data.grid);
					}
				}
			} else {
				Logger.error(`Optimization failed for ${tech}: Invalid API response`, data);
				setShowErrorStore(true, "recoverable", new Error("Invalid API response format"));
			}

			cleanup();
		};

		const onError = (err: Error | unknown) => {
			if (!isMountedRef.current) {
				cleanup();

				return;
			}

			const errMessage = err instanceof Error ? err.message : String(err);
			const isTransportError = TRANSPORT_ERROR_MESSAGES.has(errMessage);

			if (isTransportError && retryCount < MAX_TRANSPORT_RETRIES) {
				// Silently retry for transient network failures; user sees the progress
				// indicator continue rather than a disruptive error modal.
				Logger.warn(
					`Optimization transport failure for ${tech} — retrying (${retryCount + 1}/${MAX_TRANSPORT_RETRIES})`,
					{ error: errMessage }
				);
				cleanup();

				// Re-enter handleOptimize via ref to avoid a forward-declaration issue.
				// isMountedRef is checked first because cleanup may have set it false.
				if (isMountedRef.current) {
					void handleOptimizeRef.current?.(tech, forced, retryCount + 1);
				}

				return;
			}

			// All retries exhausted or a genuine application error — log and surface to user.
			Logger.error(`Optimization WebSocket error for ${tech}`, err);
			setShowErrorStore(
				true,
				"recoverable",
				err instanceof Error ? err : new Error(String(err))
			);
			cleanup();
		};

		const onDisconnect = (reason: string) => {
			// Benign if we triggered it ourselves during cleanup
			if (reason === "io client disconnect") {
				return;
			}

			const isTransportClose = reason === "transport close";

			if (isTransportClose) {
				Logger.info("Socket disconnected during optimization (transport close)", {
					reason,
				});
			} else {
				Logger.warn("Socket disconnected during optimization", { reason });
			}

			// Only trigger an error if we were still optimizing AND it's not a transport close.
			// transport close is common during network transitions and often doesn't need a modal error.
			if (isOptimizingRef.current && !isTransportClose) {
				onError(new Error(`Disconnected: ${reason}`));
			} else {
				cleanup();
			}
		};

		socket.on("progress", onProgress);
		socket.once("optimization_result", onResult);
		socket.once("connect_error", onError);
		socket.once("error", onError);
		socket.on("disconnect", onDisconnect);

		const solve_type = techGroups[tech]?.length > 1 ? activeGroups[tech] : undefined;
		const payload = {
			ship: selectedShipType,
			tech,
			available_modules: checkedModules[tech] || [],
			grid: updatedGrid,
			forced,
			send_grid_updates: isLarge,
			solve_type,
		};

		if (socket.connected) {
			socket.emit("optimize", payload);
		} else {
			socket.once("connect", () => {
				socket.emit("optimize", payload);
			});
		}
	};

	// Keep the ref in sync with the latest version of handleOptimize.
	useEffect(() => {
		handleOptimizeRef.current = handleOptimize;
	});

	/**
	 * Clears the technology stored in the "Pattern No Fit" state.
	 */
	const clearPatternNoFitTech = () => setPatternNoFitTech(null);

	/**
	 * Forces a solve for the technology that failed pattern matching.
	 *
	 * @returns {Promise<void>}
	 */
	const handleForceCurrentPnfOptimize = async () => {
		if (patternNoFitTech) await handleOptimize(patternNoFitTech, true);
	};

	return {
		solving,
		progressPercent,
		handleOptimize,
		gridContainerRef,
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	};
};
