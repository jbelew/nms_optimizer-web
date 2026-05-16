import type { ApiResponse } from "@/store/grid/gridStore";
import { startTransition, useEffect, useRef, useState } from "react";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useScrollGridIntoView } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import { useOptimizeStore } from "@/store/app/optimizeStore";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { OptimizationManager } from "@/utils/optimization/optimizationManager";
import { Logger } from "@/utils/system/monitoring";

/**
 * The return type of the `useOptimize` hook.
 *
 * @see {@link useOptimize}
 *
 * @category Hooks
 */
export interface UseOptimizeReturn {
	/** Function to clear the "No Fit" warning state. */
	clearPatternNoFitTech: () => void;
	/** Ref to the grid container for automated scrolling. */
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	/** Function to re-run optimization with forced solving for the current PNF tech. */
	handleForceCurrentPnfOptimize: () => Promise<void>;
	/**
	 * Initiates optimization for a specific technology.
	 *
	 * @param {string} tech - The unique identifier for the technology (e.g., `'pulse'`).
	 * @param {boolean} [forced] - If `true`, bypasses pattern matching and uses advanced solvers immediately.
	 *
	 * @returns {Promise<void>} Resolves when the optimization request is handled.
	 */
	handleOptimize: (tech: string, forced?: boolean) => Promise<void>;
	/** The technology identifier that failed to fit using pattern solving, if any. */
	patternNoFitTech: null | string;
	/** The current progress percentage (0-100). */
	progressPercent: number;
	/** Whether an optimization is currently in progress. */
	solving: boolean;
}

/**
 * Custom hook for managing the asynchronous optimization process via WebSockets.
 *
 * @remarks
 * This hook handles the high-level state of the optimization process:
 * 1. UI states like `solving` and `progressPercent`.
 * 2. Interaction with the global `GridStore`, `OptimizeStore`, and `TechStore`.
 * 3. Delegating the WebSocket lifecycle and retry logic to `OptimizationManager`.
 * 4. Handling UI feedback like scrolling and analytics.
 *
 * It acts as the bridge between the React UI and the `OptimizationManager`.
 *
 * @returns {UseOptimizeReturn} State and functions to control the optimization workflow.
 *
 * @see {@link OptimizationManager} for WebSocket lifecycle and retry logic.
 * @see {@link useGridStore} for state persistence.
 * @see {@link useOptimizeStore} for tracking errors and "No Fit" warnings.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { handleOptimize, solving, progressPercent } = useOptimize();
 *
 *   const onOptimize = async () => {
 *     // Initiates a WebSocket solve for pulse drive technology
 *     await handleOptimize("pulse");
 *   };
 *
 *   return (
 *     <button onClick={onOptimize} disabled={solving}>
 *       {solving ? `Solving: ${progressPercent}%` : "Optimize Pulse"}
 *     </button>
 *   );
 * };
 * ```
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
	const managerRef = useRef<null | OptimizationManager>(null);
	const isMountedRef = useRef(true);

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

			if (managerRef.current) {
				managerRef.current.cleanup();
				managerRef.current = null;
			}
		};
	}, []);

	// Scroll into view when solving on smaller screens
	useEffect(() => {
		if (solving && isMountedRef.current) {
			scrollIntoView();
		}
	}, [solving, scrollIntoView]);

	/**
	 * Initiates the optimization solve for the specified technology.
	 *
	 * @param {string} tech - Identifier for the technology.
	 * @param {boolean} [forced=false] - Whether to bypass pattern matching.
	 *
	 * @returns {Promise<void>}
	 *
	 * @example
	 * ```ts
	 * await handleOptimize("pulse");
	 * ```
	 */
	const handleOptimize = async (tech: string, forced: boolean = false) => {
		performance.mark("optimize-start");

		if (isOptimizingRef.current) {
			Logger.warn("Optimization already in progress, ignoring request");

			return;
		}

		const { setGrid, setResult } = useGridStore.getState();
		const { checkedModules } = useTechStore.getState();

		isOptimizingRef.current = true;
		setSolving(true);
		setProgressPercent(0);
		setShowErrorStore(false);

		if (forced || patternNoFitTech === tech) setPatternNoFitTech(null);

		Logger.info(`Optimization started for ${tech}`, {
			forced,
			platform: selectedShipType,
			tech,
		});

		const manager = new OptimizationManager({
			forced,
			isLarge,
			onComplete: (data: ApiResponse) => {
				performance.mark("optimize-complete");
				performance.measure("optimize-to-complete", "optimize-start", "optimize-complete");
				if (!isMountedRef.current) return;
				if (patternNoFitTech === tech) setPatternNoFitTech(null);

				Logger.info(`Optimization complete for ${tech}`, {
					bonus: data.max_bonus,
					method: data.solve_method,
					tech,
				});

				setResult(data, tech);
				const gaTech =
					tech === "pulse" && checkedModules[tech]?.includes("PC") ? "photonix" : tech;

				if (data.grid) {
					sendEvent({
						action: "optimize_tech",
						category: "ui",
						nonInteraction: false,
						platform: selectedShipType,
						solve_method: data.solve_method,
						supercharged: typeof data.max_bonus === "number" && data.max_bonus > 100,
						tech: gaTech,
						value: 1,
					});
					setGrid(data.grid);
				}

				resetProgress();
			},
			onError: (err: Error) => {
				if (!isMountedRef.current) return;

				// Handle benign transport close silently
				if (err.message === "Socket disconnected (transport close)") {
					resetProgress();

					return;
				}

				setShowErrorStore(true, "recoverable", err);
				resetProgress();
			},
			onPatternNoFit: () => {
				if (!isMountedRef.current) return;
				Logger.info(`Optimization "Pattern No Fit" for ${tech}`, {
					platform: selectedShipType,
					tech,
				});
				setPatternNoFitTech(tech);
				sendEvent({
					action: "no_fit_warning",
					category: "ui",
					nonInteraction: false,
					platform: selectedShipType,
					tech,
					value: 1,
				});
				resetProgress();
			},
			onProgress: (data) => {
				if (!isMountedRef.current) return;
				startTransition(() => {
					setProgressPercent(data.progress_percent);
					if (data.best_grid) setGrid(data.best_grid);
				});
			},
			tech,
		});

		managerRef.current = manager;
		manager.start();
	};

	/**
	 * Clears the technology stored in the "Pattern No Fit" state.
	 *
	 * @example
	 * ```ts
	 * clearPatternNoFitTech();
	 * ```
	 */
	const clearPatternNoFitTech = () => setPatternNoFitTech(null);

	/**
	 * Forces a solve for the technology that failed pattern matching.
	 *
	 * @example
	 * ```ts
	 * await handleForceCurrentPnfOptimize();
	 * ```
	 */
	const handleForceCurrentPnfOptimize = async () => {
		if (patternNoFitTech) await handleOptimize(patternNoFitTech, true);
	};

	return {
		clearPatternNoFitTech,
		gridContainerRef,
		handleForceCurrentPnfOptimize,
		handleOptimize,
		patternNoFitTech,
		progressPercent,
		solving,
	};
};
