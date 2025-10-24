import type { ApiResponse, Grid } from "../../store/GridStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import { WS_URL } from "../../constants";
import { createEmptyCell, useGridStore } from "../../store/GridStore";
import { useOptimizeStore } from "../../store/OptimizeStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechStore } from "../../store/TechStore";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";

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
 * Manages the optimization process by communicating with a WebSocket server.
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
	const gridContainerRef = useRef<HTMLDivElement | null>(null);

	const resetProgress = useCallback(() => {
		setSolving(false);
		setProgressPercent(0);
		setStatus(undefined);
	}, []);

	// Scroll into view when solving on smaller screens
	useEffect(() => {
		if (solving && gridContainerRef.current && !isLarge) {
			const element = gridContainerRef.current;
			const offset = 8;
			requestAnimationFrame(() => {
				const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
				window.scrollTo({ top, behavior: "smooth" });
			});
		}
	}, [solving, isLarge]);

	const handleOptimize = useCallback(
		async (tech: string, forced: boolean = false) => {
			const { grid, setGrid, setResult } = useGridStore.getState();
			const { checkedModules, techGroups, activeGroups } = useTechStore.getState();
			setSolving(true);
			setShowErrorStore(false);

			if (forced || patternNoFitTech === tech) setPatternNoFitTech(null);

			const updatedGrid: Grid = {
				...grid,
				cells: grid.cells.map((row) =>
					row.map((cell) =>
						cell.tech === tech
							? { ...createEmptyCell(cell.supercharged, cell.active) }
							: cell
					)
				),
			};

			// New socket per optimization
			const socket: Socket = io(WS_URL, { transports: ["websocket"] });

			const cleanup = () => {
				socket.disconnect();
				resetProgress();
			};

			socket.once("connect", () => {
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

				console.debug("Connected to WebSocket server -- ", payload);
				socket.emit("optimize", payload);
			});

			socket.on(
				"progress",
				(data: { progress_percent: number; best_grid?: Grid; status?: string }) => {
					setProgressPercent(data.progress_percent);
					if (
						data.status &&
						data.status !== "in_progress" &&
						data.status !== "new_best"
					) {
						setStatus(data.status);
					}
					if (data.best_grid) {
						setGrid(data.best_grid);
					}
				}
			);

			socket.once("optimization_result", (data: unknown) => {
				if (isApiResponse(data)) {
					if (data.solve_method === "Pattern No Fit" && !forced) {
						setPatternNoFitTech(tech);
						sendEvent({
							category: "User Interactions",
							action: "no_fit_warning",
							platform: selectedShipType,
							tech,
							value: 1,
						});
					} else {
						if (patternNoFitTech === tech) setPatternNoFitTech(null);
						setResult(data, tech);
						const gaTech =
							tech === "pulse" && checkedModules[tech]?.includes("PC")
								? "photonix"
								: tech;
						if (data.grid) {
							console.log("Optimization Result Grid:", data.grid);
							sendEvent({
								category: "User Interactions",
								action: "optimize_tech",
								platform: selectedShipType,
								tech: gaTech,
								solve_method: data.solve_method,
								value: 1,
								supercharged:
									typeof data.max_bonus === "number" && data.max_bonus > 100,
							});
							setGrid(data.grid);
						}
					}
				} else {
					console.error("Invalid API response:", data);
					setShowErrorStore(true);
				}
				cleanup();
			});

			socket.once("connect_error", (err) => {
				console.error("WebSocket connection error:", err);
				setShowErrorStore(true);
				cleanup();
			});

			socket.once("disconnect", () => {
				// console.debug("Socket disconnected:", reason);
				cleanup();
			});
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
