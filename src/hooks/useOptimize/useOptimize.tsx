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

/**
 * @interface UseOptimizeReturn
 * @property {boolean} solving - Whether an optimization is in progress.
 * @property {(tech: string, forced?: boolean) => Promise<void>} handleOptimize - Function to handle the optimization process.
 * @property {React.MutableRefObject<HTMLDivElement|null>} gridContainerRef - Ref to the grid container.
 * @property {string|null} patternNoFitTech - The technology for which a "Pattern No Fit" occurred.
 * @property {() => void} clearPatternNoFitTech - Function to clear the patternNoFitTech state.
 * @property {() => Promise<void>} handleForceCurrentPnfOptimize - Function to force optimization for the current patternNoFitTech.
 */
interface UseOptimizeReturn {
	solving: boolean;
	progressPercent: number;
	handleOptimize: (tech: string, forced?: boolean) => Promise<void>;
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	patternNoFitTech: string | null;
	clearPatternNoFitTech: () => void;
	handleForceCurrentPnfOptimize: () => Promise<void>;
}

/**
 * Type guard to check if a given value is of type ApiResponse.
 *
 * @param {unknown} value - The value to check.
 * @returns {value is ApiResponse} True if the value is ApiResponse, false otherwise.
 */
function isApiResponse(value: unknown): value is ApiResponse {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	const obj = value as Record<string, unknown>;

	if (typeof obj.solve_method !== "string") {
		return false;
	}

	if (obj.grid !== null) {
		if (typeof obj.grid !== "object" || !obj.grid) return false;
		const gridCandidate = obj.grid as Record<string, unknown>;
		if (
			!Array.isArray(gridCandidate.cells) ||
			typeof gridCandidate.width !== "number" ||
			typeof gridCandidate.height !== "number"
		) {
			return false;
		}
	}

	if (Object.prototype.hasOwnProperty.call(obj, "max_bonus") && typeof obj.max_bonus !== "number")
		return false;
	if (
		Object.prototype.hasOwnProperty.call(obj, "solved_bonus") &&
		typeof obj.solved_bonus !== "number"
	)
		return false;
	return true;
}

/**
 * Custom hook for managing optimization logic, including API calls, state management,
 * and integration with other stores.
 *
 * @returns {UseOptimizeReturn} An object containing optimization state and handlers.
 */
export const useOptimize = (): UseOptimizeReturn => {
	const { setGrid, setResult, grid } = useGridStore();
	const [solving, setSolving] = useState<boolean>(false);
	const [progressPercent, setProgressPercent] = useState<number>(0);
	const gridContainerRef = useRef<HTMLDivElement>(null);
	const { sendEvent } = useAnalytics();
	const {
		setShowError: setShowErrorStore,
		patternNoFitTech,
		setPatternNoFitTech,
	} = useOptimizeStore();
	const { checkedModules } = useTechStore();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const isLarge = useBreakpoint("1024px");

	/**
	 * Effect to scroll the grid container into view when solving on smaller screens.
	 */
	useEffect(() => {
		if (solving && gridContainerRef.current && !isLarge) {
			const element = gridContainerRef.current;
			const offset = 8;

			/**
			 * Scrolls the grid container into view with a smooth behavior.
			 */
			const scrollIntoView = () => {
				requestAnimationFrame(() => {
					const elementRect = element.getBoundingClientRect();
					const absoluteElementTop = elementRect.top + window.pageYOffset;
					const targetScrollPosition = absoluteElementTop - offset;

					window.scrollTo({
						top: targetScrollPosition,
						behavior: "smooth",
					});
				});
			};
			requestAnimationFrame(scrollIntoView);
		}
	}, [isLarge, solving]);

	/**
	 * Handles the optimization process, making an API call and updating the grid state.
	 *
	 * @param {string} tech - The technology to optimize.
	 * @param {boolean} [forced=false] - Whether the optimization is forced (e.g., after a PNF).
	 */
	const handleOptimize = useCallback(
		async (tech: string, forced: boolean = false) => {
			setSolving(true);
			// Yield to the main thread to allow UI updates (e.g., loading indicators) to render.
			await new Promise((resolve) => setTimeout(resolve, 0));
			setShowErrorStore(false);

			if (forced || patternNoFitTech === tech) {
				setPatternNoFitTech(null);
			}

			try {
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

				const socket: Socket = io(WS_URL);

				socket.on("connect", () => {
					console.log("Connected to WebSocket server.");
					socket.emit("optimize", {
						ship: selectedShipType,
						tech,
						player_owned_rewards: checkedModules[tech] || [],
						grid: updatedGrid,
						forced,
					});
				});

				socket.on("progress", (data: { progress_percent: number }) => {
					setProgressPercent(data.progress_percent);
				});

				socket.on("optimization_result", (data: unknown) => {
					if (isApiResponse(data)) {
						if (
							data.solve_method === "Pattern No Fit" &&
							data.grid === null &&
							!forced
						) {
							setPatternNoFitTech(tech);
							sendEvent({
								category: "User Interactions",
								action: "no_fit_warning",
								platform: selectedShipType,
								tech: tech,
								value: 1,
							});
						} else {
							if (patternNoFitTech === tech) {
								setPatternNoFitTech(null);
							}
							setResult(data, tech);
							if (data.grid) {
								setGrid(data.grid);
							} else {
								console.warn(
									"API response did not contain a grid for a successful or forced solve. Grid not updated.",
									data
								);
							}

							console.log("Response from API:", data);
							const gaTech =
								tech === "pulse" && checkedModules[tech]?.includes("PC")
									? "photonix"
									: tech;
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
						}
					} else {
						console.error(
							"Invalid API response structure for successful optimization:",
							data
						);
						setShowErrorStore(true);
					}
					setSolving(false);
					setProgressPercent(0); // Reset progress
					socket.disconnect();
				});

				socket.on("connect_error", (error: Error) => {
					console.error("WebSocket connection error:", error);
					setShowErrorStore(true);
					setSolving(false);
					setProgressPercent(0); // Reset progress
				});

				socket.on("disconnect", (reason: Socket.DisconnectReason) => {
					console.log("Disconnected from WebSocket server:", reason);
					setSolving(false);
					setProgressPercent(0); // Reset progress
				});
			} catch (error) {
				console.error("Error during optimization:", error);
				setResult(null, tech);
				setShowErrorStore(true);
			}
		},
		[
			setShowErrorStore,
			patternNoFitTech,
			setPatternNoFitTech,
			grid,
			selectedShipType,
			checkedModules,
			sendEvent,
			setResult,
			setGrid,
		]
	);

	/**
	 * Clears the patternNoFitTech state.
	 */
	const clearPatternNoFitTech = useCallback(() => {
		setPatternNoFitTech(null);
	}, [setPatternNoFitTech]);

	/**
	 * Forces optimization for the current patternNoFitTech if it is set.
	 */
	const handleForceCurrentPnfOptimize = useCallback(async () => {
		if (patternNoFitTech) {
			await handleOptimize(patternNoFitTech, true);
		}
	}, [patternNoFitTech, handleOptimize]);

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
