import type { ApiResponse, Grid } from "../../store/GridStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createEmptyCell, useGridStore } from "../../store/GridStore";
import { useOptimizeStore } from "../../store/OptimizeStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechStore } from "../../store/TechStore";
import { Logger } from "../../utils/logger";
import { socketManager } from "../../utils/socketManager";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";
import { useScrollGridIntoView } from "../useScrollGridIntoView/useScrollGridIntoView";

export interface UseOptimizeReturn {
	solving: boolean;
	progressPercent: number;
	status?: string;
	handleOptimize: (tech: string, forced?: boolean) => Promise<void>;
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	patternNoFitTech: string | null;
	clearPatternNoFitTech: () => void;
	handleForceCurrentPnfOptimize: () => Promise<void>;
}

/**
 * Type guard for ApiResponse
 *
 * @param {unknown} value - The value to check.
 * @returns {value is ApiResponse} - Whether the value is an ApiResponse.
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
 * Manages the optimization process by communicating with a persistent singleton WebSocket connection.
 * It handles sending optimization requests, receiving progress updates, and processing the final results.
 * It also manages UI state related to the optimization, such as loading indicators and error states.
 *
 * @returns {UseOptimizeReturn} An object containing state and functions for the optimization process.
 * @property {boolean} solving - True if an optimization is currently in progress.
 * @property {number} progressPercent - The percentage completion of the current optimization.
 * @property {(tech: string, forced?: boolean) => Promise<void>} handleOptimize - Function to initiate an optimization for a given technology.
 * @property {React.MutableRefObject<HTMLDivElement | null>} gridContainerRef - Ref for the grid container, used for scrolling on smaller screens.
 * @property {string | null} patternNoFitTech - The technology that failed to fit using the pattern-based solver, offering a forced solve.
 * @property {() => void} clearPatternNoFitTech - Function to clear the `patternNoFitTech` state.
 * @property {() => Promise<void>} handleForceCurrentPnfOptimize - Function to run a forced optimization for the technology that previously failed to fit.
 */
export const useOptimize = (): UseOptimizeReturn => {
	const {
		setShowError: setShowErrorStore,
		patternNoFitTech,
		setPatternNoFitTech,
	} = useOptimizeStore();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const { sendEvent } = useAnalytics();
	const isLarge = useBreakpoint("1024px");

	const [solving, setSolving] = useState(false);
	const [progressPercent, setProgressPercent] = useState(0);
	const [status, setStatus] = useState<string | undefined>();
	const isOptimizingRef = useRef(false);
	const scrollOptions = useMemo(() => ({ skipOnLargeScreens: true }), []);
	const { gridContainerRef, scrollIntoView } = useScrollGridIntoView(scrollOptions);

	const resetProgress = useCallback(() => {
		setSolving(false);
		isOptimizingRef.current = false;
		setProgressPercent(0);
		setStatus(undefined);
	}, []);

	// Initialize socket connection on mount
	useEffect(() => {
		socketManager.connect();
	}, []);

	// Scroll into view when solving on smaller screens
	useEffect(() => {
		if (solving) {
			scrollIntoView();
		}
	}, [solving, scrollIntoView]);

	const handleOptimize = useCallback(
		async (tech: string, forced: boolean = false) => {
			if (isOptimizingRef.current) {
				Logger.warn("Optimization already in progress, ignoring request");

				return;
			}

			const { grid, setGrid, setResult } = useGridStore.getState();
			const { checkedModules, techGroups, activeGroups } = useTechStore.getState();

			isOptimizingRef.current = true;
			setSolving(true);
			setProgressPercent(0);
			setStatus(undefined);
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

			const socket = socketManager.connect();

			const cleanup = () => {
				socket.off("progress", onProgress);
				socket.off("optimization_result", onResult);
				socket.off("connect_error", onError);
				socket.off("error", onError);
				socket.off("disconnect", onDisconnect);
				resetProgress();
			};

			const onProgress = (data: {
				progress_percent: number;
				best_grid?: Grid;
				status?: string;
			}) => {
				setProgressPercent(data.progress_percent);
				setStatus("Optimized with Rust, obviously!");

				if (data.best_grid) {
					setGrid(data.best_grid);
				}
			};

			const onResult = (data: unknown) => {
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
					setShowErrorStore(
						true,
						"recoverable",
						new Error("Invalid API response format")
					);
				}

				cleanup();
			};

			const onError = (err: Error | unknown) => {
				Logger.error(`Optimization WebSocket error for ${tech}`, err);
				setShowErrorStore(
					true,
					"recoverable",
					err instanceof Error ? err : new Error(String(err))
				);
				cleanup();
			};

			const onDisconnect = (reason: string) => {
				const isBenign = reason === "io client disconnect" || reason === "transport close";

				if (isBenign) {
					Logger.info("Socket disconnected during optimization (benign)", { reason });
				} else {
					Logger.warn("Socket disconnected during optimization", { reason });
				}

				// Only trigger an error if it wasn't a benign disconnect.
				// If it's benign (like tab closure), the component is likely unmounting anyway.
				if (isOptimizingRef.current && !isBenign) {
					onError(new Error(`Disconnected: ${reason}`));
				} else {
					cleanup();
				}
			};

			socket.on("progress", onProgress);
			socket.once("optimization_result", onResult);
			socket.once("connect_error", onError);
			socket.once("error", onError);
			socket.once("disconnect", onDisconnect);

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
		},
		[
			setShowErrorStore,
			patternNoFitTech,
			setPatternNoFitTech,
			selectedShipType,
			sendEvent,
			resetProgress,
			isLarge,
		]
	);

	const clearPatternNoFitTech = useCallback(
		() => setPatternNoFitTech(null),
		[setPatternNoFitTech]
	);

	const handleForceCurrentPnfOptimize = useCallback(async () => {
		if (patternNoFitTech) await handleOptimize(patternNoFitTech, true);
	}, [patternNoFitTech, handleOptimize]);

	return {
		solving,
		progressPercent,
		status,
		handleOptimize,
		gridContainerRef,
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	};
};
