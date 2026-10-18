import type { ApiResponse } from "@/store/grid/gridStore";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useLatest } from "@/hooks/useLatest/useLatest";
import { useScrollGridIntoView } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useTechStore } from "@/store/tech/techStore";
import { useOptimizeStore, useShakeStore } from "@/store/ui/uiStore";
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
	/** Whether an optimization is currently in progress. */
	solving: boolean;
}

const SCROLL_OPTIONS = { skipOnLargeScreens: true };

/** Module-scoped active WebSocket manager shared across all mounted `useOptimize` consumers. */
let activeManager: null | OptimizationManager = null;
/** Module-scoped lock preventing concurrent optimization requests across callers. */
let isOptimizingActive = false;
/** Count of currently mounted `useOptimize` hook consumers. */
let mountedCount = 0;

/**
 * Custom hook for managing the asynchronous optimization process via WebSockets.
 *
 * @remarks
 * This hook acts as the central interface for:
 * 1. Enforcing the full-grid shake guard (`isGridFull && !hasTechInGrid`) via {@link useShakeStore}.
 * 2. Executing a pre-solve **Technology Reset** via {@link sessionCoordinator.resetTechnology}.
 * 3. Dispatching optimization requests to the Python backend via a shared {@link OptimizationManager}.
 * 4. Synchronizing WebSocket state (solving, progress, PNF warnings) to {@link useOptimizeStore}.
 * 5. Handling automatic view scrolling on touch devices and tracking interaction analytics.
 *
 * Because the active {@link OptimizationManager} and in-flight lock are module-scoped,
 * multiple components (`MainAppLayoutContent`, `TechTreeRow`, `ModuleSelectionDialog`,
 * `OptimizationAlertDialog`) can call `useOptimize()` directly without prop-drilling or
 * intermediate context providers.
 *
 * @returns {UseOptimizeReturn} An object containing the optimization state and trigger handlers.
 *
 * @see {@link OptimizationManager} for the underlying socket logic.
 * @see {@link sessionCoordinator.resetTechnology} for pre-solve Technology Reset.
 * @see {@link useOptimizeStore} for tracking errors and "No Fit" warnings.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { solving, handleOptimize } = useOptimize();
 *
 * const onOptimize = () => {
 *   void handleOptimize("pulse");
 * };
 *
 * return (
 *   <button onClick={onOptimize} disabled={solving}>
 *     {solving ? "Solving..." : "Optimize Pulse"}
 *   </button>
 * );
 * ```
 */
export const useOptimize = (): UseOptimizeReturn => {
	const {
		patternNoFitTech,
		setPatternNoFitTech,
		setProgressPercent,
		setShowErrorStore,
		setSolving,
		solving,
	} = useOptimizeStore(
		useShallow((s) => ({
			patternNoFitTech: s.status.type === "warning" ? s.status.tech : null,
			setPatternNoFitTech: s.setPatternNoFitTech,
			setProgressPercent: s.setProgressPercent,
			setShowErrorStore: s.setShowError,
			setSolving: s.setSolving,
			solving: s.status.type === "solving",
		}))
	);

	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const { sendEvent } = useAnalytics();
	const isLarge = useBreakpoint("1024px");

	const patternNoFitTechRef = useLatest(patternNoFitTech);
	const selectedShipTypeRef = useLatest(selectedShipType);
	const isLargeRef = useLatest(isLarge);
	const sendEventRef = useLatest(sendEvent);

	const { gridContainerRef, scrollIntoView } = useScrollGridIntoView(SCROLL_OPTIONS);

	const resetProgress = useCallback(() => {
		isOptimizingActive = false;
		activeManager = null;
		if (mountedCount <= 0) return;
		setSolving(false);
		setProgressPercent(0);
	}, [setSolving, setProgressPercent]);

	// Track mounted consumers and tear down active socket only when the last consumer unmounts
	useEffect(() => {
		mountedCount += 1;

		return () => {
			mountedCount -= 1;

			if (mountedCount <= 0) {
				mountedCount = 0;
				isOptimizingActive = false;

				if (activeManager) {
					activeManager.cleanup();
					activeManager = null;
				}
			}
		};
	}, []);

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
	const handleOptimize = useCallback(
		async (tech: string, forced: boolean = false) => {
			performance.mark("optimize-start");

			if (isOptimizingActive) {
				Logger.warn("Optimization already in progress, ignoring request");

				return;
			}

			const initialGridState = useGridStore.getState();
			const isGridFull = Boolean(initialGridState.isGridFull);
			const hasTechInGrid = Boolean(initialGridState.activeTechs?.has?.(tech));

			if (isGridFull && !hasTechInGrid) {
				useShakeStore.getState().triggerShake();

				return;
			}

			// Perform atomic Technology Reset before starting the solve
			sessionCoordinator.resetTechnology(tech);

			const { grid, setGrid } = useGridStore.getState();
			const { activeGroups, checkedModules, techGroups } = useTechStore.getState();
			const ship = usePlatformStore.getState().selectedPlatform;
			const availableModules = checkedModules[tech] || [];
			const solveType = techGroups[tech]?.length > 1 ? activeGroups[tech] : undefined;

			isOptimizingActive = true;
			setSolving(true);
			setProgressPercent(0);
			setShowErrorStore(false);
			if (forced || patternNoFitTechRef.current === tech) setPatternNoFitTech(null);
			scrollIntoView();

			Logger.info(`Optimization started for ${tech}`, {
				forced,
				platform: selectedShipTypeRef.current,
				tech,
			});

			const manager = new OptimizationManager({
				availableModules,
				forced,
				grid,
				isLarge: isLargeRef.current,
				onComplete: (data: ApiResponse) => {
					performance.mark("optimize-complete");
					performance.measure(
						"optimize-to-complete",
						"optimize-start",
						"optimize-complete"
					);
					if (mountedCount <= 0) return;

					if (patternNoFitTechRef.current === tech) setPatternNoFitTech(null);

					Logger.info(`Optimization complete for ${tech}`, {
						bonus: data.maxBonus,
						method: data.solveMethod,
						tech,
					});

					sessionCoordinator.commitOptimizationResult(data, tech);
					const currentCheckedModules = useTechStore.getState().checkedModules;
					const gaTech =
						tech === "pulse" && currentCheckedModules[tech]?.includes("PC")
							? "photonix"
							: tech;

					if (data.grid) {
						sendEventRef.current({
							action: "optimize_tech",
							category: "ui",
							nonInteraction: false,
							platform: selectedShipTypeRef.current,
							solveMethod: data.solveMethod,
							supercharged: typeof data.maxBonus === "number" && data.maxBonus > 100,
							tech: gaTech,
							value: 1,
						});
						setGrid(data.grid);
					}

					resetProgress();
				},
				onError: (err: Error) => {
					if (mountedCount <= 0) return;

					// Handle benign transport close silently
					if (err.message === "Socket disconnected (transport close)") {
						resetProgress();

						return;
					}

					setShowErrorStore(true, "recoverable", err);
					resetProgress();
				},
				onPatternNoFit: () => {
					if (mountedCount <= 0) return;
					Logger.info(`Optimization "Pattern No Fit" for ${tech}`, {
						platform: selectedShipTypeRef.current,
						tech,
					});
					setPatternNoFitTech(tech);
					sendEventRef.current({
						action: "no_fit_warning",
						category: "ui",
						nonInteraction: false,
						platform: selectedShipTypeRef.current,
						tech,
						value: 1,
					});
					resetProgress();
				},
				onProgress: (data) => {
					if (mountedCount <= 0) return;
					setProgressPercent(data.progress_percent);
					if (data.best_grid) setGrid(data.best_grid);
				},
				ship,
				solveType,
				tech,
			});

			activeManager = manager;
			void manager.start();
		},
		[
			setSolving,
			setProgressPercent,
			setShowErrorStore,
			setPatternNoFitTech,
			scrollIntoView,
			resetProgress,
			isLargeRef,
			patternNoFitTechRef,
			selectedShipTypeRef,
			sendEventRef,
		]
	);

	/**
	 * Clears the technology stored in the "Pattern No Fit" state.
	 *
	 * @example
	 * ```ts
	 * clearPatternNoFitTech();
	 * ```
	 */
	const clearPatternNoFitTech = useCallback(
		() => setPatternNoFitTech(null),
		[setPatternNoFitTech]
	);

	/**
	 * Forces a solve for the technology that failed pattern matching.
	 *
	 * @example
	 * ```ts
	 * await handleForceCurrentPnfOptimize();
	 * ```
	 */
	const handleForceCurrentPnfOptimize = useCallback(async () => {
		if (patternNoFitTechRef.current) await handleOptimize(patternNoFitTechRef.current, true);
	}, [handleOptimize, patternNoFitTechRef]);

	return {
		clearPatternNoFitTech,
		gridContainerRef,
		handleForceCurrentPnfOptimize,
		handleOptimize,
		patternNoFitTech,
		solving,
	};
};
