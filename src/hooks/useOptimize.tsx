import type { ApiResponse, Grid } from "../store/GridStore";
import { useCallback, useEffect, useRef, useState } from "react";

import { API_URL } from "../constants";
import { createEmptyCell, useGridStore } from "../store/GridStore";
import { useOptimizeStore } from "../store/OptimizeStore";
import { usePlatformStore } from "../store/PlatformStore";
import { useTechStore } from "../store/TechStore";
import { useAnalytics } from "./useAnalytics";
import { useBreakpoint } from "./useBreakpoint";

interface UseOptimizeReturn {
	solving: boolean;
	handleOptimize: (tech: string, forced?: boolean) => Promise<void>;
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	patternNoFitTech: string | null;
	clearPatternNoFitTech: () => void;
	handleForceCurrentPnfOptimize: () => Promise<void>;
}

interface ApiErrorData {
	message?: string;
}

function isApiErrorData(value: unknown): value is ApiErrorData {
	if (typeof value === "object" && value !== null) {
		const potential = value as { message?: unknown };
		return typeof potential.message === "string" || typeof potential.message === "undefined";
	}
	return false;
}

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

export const useOptimize = (): UseOptimizeReturn => {
	const { setGrid, setResult, grid } = useGridStore();
	const [solving, setSolving] = useState<boolean>(false);
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

	useEffect(() => {
		if (solving && gridContainerRef.current && !isLarge) {
			const element = gridContainerRef.current;
			const offset = 8;

			const scrollIntoView = () => {
				const elementRect = element.getBoundingClientRect();
				const absoluteElementTop = elementRect.top + window.pageYOffset;
				const targetScrollPosition = absoluteElementTop - offset;

				window.scrollTo({
					top: targetScrollPosition,
					behavior: "smooth",
				});
			};
			requestAnimationFrame(scrollIntoView);
		}
	}, [isLarge, solving]);

	const handleOptimize = useCallback(
		async (tech: string, forced: boolean = false) => {
			setSolving(true);
			setShowErrorStore(false);

			if (forced || patternNoFitTech === tech) {
				setPatternNoFitTech(null);
			}

			try {
				const updatedGrid: Grid = {
					...grid,
					cells: grid.cells.map((row) =>
						row.map((cell) =>
							cell.tech === tech ? { ...createEmptyCell(cell.supercharged, cell.active) } : cell
						)
					),
				};

				const response = await fetch(API_URL + "optimize", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						ship: selectedShipType,
						tech,
						player_owned_rewards: checkedModules[tech] || [],
						grid: updatedGrid,
						forced,
					}),
				});

				if (!response.ok) {
					const errorJson: unknown = await response.json();
					let finalErrorMessage = `Failed to fetch data: ${response.status} ${response.statusText}`;

					if (isApiErrorData(errorJson)) {
						if (errorJson.message) {
							finalErrorMessage = errorJson.message;
						}
					}
					throw new Error(finalErrorMessage);
				}

				const responseDataUnknown: unknown = await response.json();

				if (isApiResponse(responseDataUnknown)) {
					const data: ApiResponse = responseDataUnknown;

					if (data.solve_method === "Pattern No Fit" && data.grid === null && !forced) {
						setPatternNoFitTech(tech);
						sendEvent({
							name: "no_fit_warning",
							params: {
								category: "User Interactions",
								platform: selectedShipType,
								tech: tech,
							},
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
						sendEvent({
							name: "optimize_tech",
							params: {
								category: "User Interactions",
								platform: selectedShipType,
								tech: tech,
								solve_method: data.solve_method,
							},
						});
					}
				} else {
					throw new Error("Invalid API response structure for successful optimization.");
				}
			} catch (error) {
				console.error("Error during optimization:", error);
				setResult(null, tech);
				setShowErrorStore(true);
			} finally {
				setSolving(false);
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

	const clearPatternNoFitTech = useCallback(() => {
		setPatternNoFitTech(null);
	}, [setPatternNoFitTech]);

	const handleForceCurrentPnfOptimize = useCallback(async () => {
		if (patternNoFitTech) {
			await handleOptimize(patternNoFitTech, true);
		}
	}, [patternNoFitTech, handleOptimize]);

	return {
		solving,
		handleOptimize,
		gridContainerRef,
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	};
};
