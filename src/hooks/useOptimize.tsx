// src/hooks/useOptimize.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useAnalytics } from "./useAnalytics";

import { API_URL } from "../constants";
import { createEmptyCell, type ApiResponse, type Grid, useGridStore } from "../store/GridStore";
import { useOptimizeStore } from "../store/OptimizeStore";
import { useTechStore } from "../store/TechStore";
import { useBreakpoint } from "./useBreakpoint";
import { usePlatformStore } from "../store/PlatformStore";

interface UseOptimizeReturn {
	solving: boolean;
	handleOptimize: (tech: string, forced?: boolean) => Promise<void>;
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	// showError: boolean; // No longer returned by this hook
	// setShowError: React.Dispatch<React.SetStateAction<boolean>>; // No longer returned by this hook
	patternNoFitTech: string | null;
	clearPatternNoFitTech: () => void; // To allow UI to clear the PNF state (e.g., on dialog cancel)
	// New handler for the dialog's "Force Optimize" action
	handleForceCurrentPnfOptimize: () => Promise<void>;
}

interface ApiErrorData {
	message?: string;
	// Add other potential error fields if known
}

// Type guard for ApiErrorData
function isApiErrorData(value: unknown): value is ApiErrorData {
	if (typeof value === "object" && value !== null) {
		// Check if 'message' is either a string or not present (which is fine for an optional property)
		// or if it's explicitly undefined.
		const potential = value as { message?: unknown };
		return typeof potential.message === "string" || typeof potential.message === "undefined";
	}
	return false;
}

// Type guard for ApiResponse
// Note: This assumes the structure of ApiResponse based on its usage.
// For a more robust solution, ensure this guard accurately reflects the ApiResponse interface from GridStore.ts.
function isApiResponse(value: unknown): value is ApiResponse {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	const obj = value as Record<string, unknown>; // Cast to a general object for property access

	// Check for mandatory properties and their types
	if (typeof obj.solve_method !== "string") {
		return false;
	}

	// Check for 'grid' property: can be null or an object.
	// A more detailed 'isGrid' type guard would be better if Grid structure is complex.
	if (obj.grid !== null) {
		if (typeof obj.grid !== "object" || !obj.grid) return false; // Ensure grid is an object if not null
		const gridCandidate = obj.grid as Record<string, unknown>;
		// Basic check for Grid structure
		if (
			!Array.isArray(gridCandidate.cells) ||
			typeof gridCandidate.width !== "number" ||
			typeof gridCandidate.height !== "number"
		) {
			return false;
		}
	}

	// Check for optional properties (if they exist, they must be numbers)
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
		// showError, // Not used within this hook if not returned
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

	// --- Optimization Request Logic ---
	const handleOptimize = useCallback(
		async (tech: string, forced: boolean = false) => {
			setSolving(true);
			setShowErrorStore(false); // Clear previous errors

			// If forcing or re-optimizing a tech that previously hit PNF, clear its PNF status.
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

				console.log("DEBUG: Sending grid to API:", updatedGrid);
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
						// If errorJson.message is a non-empty string, use it.
						// Otherwise, the default finalErrorMessage is used.
						if (errorJson.message) {
							finalErrorMessage = errorJson.message;
						}
					}
					throw new Error(finalErrorMessage);
				}

				const responseDataUnknown: unknown = await response.json();

				if (isApiResponse(responseDataUnknown)) {
					const data: ApiResponse = responseDataUnknown; // Now data is safely typed

					if (data.solve_method === "Pattern No Fit" && data.grid === null && !forced) {
						setPatternNoFitTech(tech);
						sendEvent({
							category: "User Interactions",
							action: "no_fit_warning",
							platform: selectedShipType,
							tech: tech,
						});
						// Do not set grid or result yet, wait for user to force
					} else {
						// This block handles:
						// 1. Successful solve (not "Pattern No Fit")
						// 2. Successful FORCED solve
						// 3. API returning "Pattern No Fit" but with a grid (unexpected, but handled)
						if (patternNoFitTech === tech) {
							// Clear PNF if it was for the current tech
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
							category: "User Interactions",
							action: "optimize_tech",
							platform: selectedShipType,
							tech: tech,
							solve_method: data.solve_method,
						});
					}
				} else {
					throw new Error("Invalid API response structure for successful optimization.");
				}
			} catch (error) {
				console.error("Error during optimization:", error);
				setResult(null, tech); // Clear any previous results for this tech on error
				setShowErrorStore(true);
			} finally {
				setSolving(false);
			}
		},
		[setShowErrorStore, patternNoFitTech, setPatternNoFitTech, grid, selectedShipType, checkedModules, sendEvent, setResult, setGrid]
	);

	const clearPatternNoFitTech = useCallback(() => {
		setPatternNoFitTech(null);
	}, [setPatternNoFitTech]);

	// New callback specifically for the PNF dialog's "Force" action
	const handleForceCurrentPnfOptimize = useCallback(async () => {
		// patternNoFitTech is from the useOptimizeStore()
		if (patternNoFitTech) {
			await handleOptimize(patternNoFitTech, true);
			// handleOptimize will internally call setPatternNoFitTech(null) when forced
		}
	}, [patternNoFitTech, handleOptimize]);

	return {
		solving,
		handleOptimize,
		gridContainerRef,
		// showError, // Removed from return
		// setShowError, // Removed from return
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	};
};
