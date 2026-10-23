import { useCallback, useEffect } from "react";
import type { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { useShallow } from "zustand/react/shallow";

import type { ApiResponse, Grid } from "@/store/grid/gridStore";
import { WS_URL } from "@/constants";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useLatest } from "@/hooks/useLatest/useLatest";
import { useScrollGridIntoView } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { resolveSolveQuality, sessionCoordinator } from "@/store/sessionCoordinator";
import { useTechStore } from "@/store/tech/techStore";
import { useOptimizeStore, useShakeStore } from "@/store/ui/uiStore";
import { Logger } from "@/utils/system/monitoring";

/**
 * The return type of the `useOptimize` hook.
 *
 * @see {@link useOptimize}
 *
 * @category Hooks
 */
export interface UseOptimizeReturn {
	/** Function to clear the "Pattern No Fit" warning state. */
	clearPatternNoFitTech: () => void;
	/** Ref to the grid container for automated scrolling. */
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	/** Function to re-run optimization with a Forced Solve for the current Pattern No Fit technology. */
	handleForceCurrentPnfOptimize: () => Promise<void>;
	/**
	 * Initiates optimization for a specific Technology Category.
	 *
	 * @param tech - The unique identifier for the Technology Category (e.g., `'pulse'`).
	 * @param forced - If `true`, executes a Forced Solve bypassing pattern templates.
	 *
	 * @returns Resolves when the optimization request is dispatched.
	 */
	handleOptimize: (tech: string, forced?: boolean) => Promise<void>;
	/** The Technology Category identifier that encountered a Pattern No Fit warning, if any. */
	patternNoFitTech: null | string;
	/** Whether an optimization solve is currently in progress. */
	solving: boolean;
}

/** Maximum number of silent transport-error retries before surfacing the error modal. */
const MAX_TRANSPORT_RETRIES = 2;

const SCROLL_OPTIONS = { skipOnLargeScreens: true };

/**
 * Standard configuration options for the Socket.IO connection.
 *
 * @remarks
 * - `reconnection: false` — retry strategy is owned by `useOptimize`.
 * - `forceNew: true` — each optimization solve gets a fresh connection manager.
 * - `transports: ["websocket", "polling"]` — allows fallback to HTTP long-polling.
 *
 * @category Hooks
 */
export const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
	forceNew: true,
	reconnection: false,
	timeout: 20000,
	transports: ["websocket", "polling"],
};

/**
 * Canonical set of transient transport-level error messages from `engine.io-client`
 * that should be retried silently before surfacing an error dialog.
 */
const TRANSPORT_ERROR_MESSAGES = new Set(["timeout", "websocket error"]);

/** Module-scoped teardown callback for the active solve session across all mounted consumers. */
let activeCleanup: (() => void) | null = null;
/** Module-scoped lock preventing concurrent optimization requests across callers. */
let isOptimizingActive = false;
/** Count of currently mounted `useOptimize` hook consumers. */
let mountedCount = 0;

/**
 * Dynamically imports `socket.io-client` and opens a new WebSocket connection for a solve.
 *
 * @returns A connected or connecting `Socket` instance, or `null` if initialization fails.
 */
async function createSocket(): Promise<null | Socket> {
	try {
		Logger.info("Creating new WebSocket connection", { url: WS_URL });

		const { io } = await import("socket.io-client");

		return io(WS_URL, SOCKET_OPTIONS);
	} catch (error) {
		Logger.error("Failed to create WebSocket instance", { error });

		return null;
	}
}

/**
 * Validates that a wire payload conforms to the internal `ApiResponse` structure.
 *
 * @param value - The translated response object to validate.
 *
 * @returns `true` when `value` is a structurally valid `ApiResponse`.
 */
function isApiResponse(value: unknown): value is ApiResponse {
	if (value === null || typeof value !== "object") return false;
	const obj = value as Record<string, unknown>;
	if (typeof obj.solveMethod !== "string") return false;

	if (obj.grid !== null) {
		if (typeof obj.grid !== "object" || !obj.grid) return false;
		const gridCandidate = obj.grid as Record<string, unknown>;
		if (!Array.isArray(gridCandidate.cells) || typeof gridCandidate.width !== "number")
			return false;
	}

	if (obj.maxBonus !== undefined && typeof obj.maxBonus !== "number") return false;
	if (obj.solvedBonus !== undefined && typeof obj.solvedBonus !== "number") return false;

	return true;
}

/**
 * Normalizes a raw Socket.IO `optimization_result` payload from snake_case or camelCase
 * into a validated `ApiResponse`.
 *
 * @param data - Raw wire payload emitted by the Python backend.
 *
 * @returns The validated `ApiResponse`, or `null` if the payload is malformed.
 */
function parseOptimizationResult(data: Record<string, unknown>): ApiResponse | null {
	const translatedData: ApiResponse = {
		grid: data.grid as ApiResponse["grid"],
		maxBonus: (data.maxBonus ?? data.max_bonus) as number,
		solvedBonus: (data.solvedBonus ?? data.solved_bonus) as number,
		solveMethod: (data.solveMethod ?? data.solve_method) as string,
	};

	return isApiResponse(translatedData) ? translatedData : null;
}

/**
 * Resolves the analytics identifier for a Technology Category based on its active Module Selection.
 *
 * @param tech - The Technology Category identifier.
 * @param checkedModules - Map of Technology Category identifiers to checked module IDs.
 *
 * @returns `"photonix"` when `"pulse"` includes the `"PC"` module, otherwise `tech`.
 */
function resolveAnalyticsTechName(
	tech: string,
	checkedModules: Record<string, string[] | undefined>,
): string {
	return tech === "pulse" && checkedModules[tech]?.includes("PC") ? "photonix" : tech;
}

/**
 * Custom hook for orchestrating technology layout optimization over WebSockets.
 *
 * @remarks
 * This hook acts as the deep interface for:
 * 1. Enforcing the full-grid Slot Restriction shake guard (`isGridFull && !hasTechInGrid`) via {@link useShakeStore}.
 * 2. Executing a pre-solve **Technology Reset** via {@link sessionCoordinator.resetTechnology}.
 * 3. Managing the Socket.IO connection lifecycle, up to {@link MAX_TRANSPORT_RETRIES} silent transport retries, and wire-format translation.
 * 4. Synchronizing solve progress, **Pattern No Fit** warnings, **Forced Solve** retries, and atomic result commits via {@link sessionCoordinator.commitOptimizationResult} and {@link useOptimizeStore}.
 * 5. Handling automatic viewport scrolling on compact viewports and dispatching analytics events.
 *
 * Because the active socket session and in-flight lock are module-scoped, multiple callers
 * (`MainAppLayoutContent`, `TechTreeRow`, `ModuleSelectionDialog`, `OptimizationAlertDialog`)
 * invoke `useOptimize()` directly without prop-drilling or intermediate context providers.
 *
 * @returns Optimization state and trigger callbacks.
 *
 * @see {@link UseOptimizeReturn}
 * @see {@link sessionCoordinator.resetTechnology}
 * @see {@link sessionCoordinator.commitOptimizationResult}
 * @see {@link useOptimizeStore}
 * @see {@link ./useOptimize.test.tsx Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { solving, handleOptimize } = useOptimize();
 *
 * return (
 *   <button onClick={() => void handleOptimize("pulse")} disabled={solving}>
 *     {solving ? "Solving..." : "Optimize Pulse"}
 *   </button>
 * );
 * // dispatches pulse optimization and commits solved layout to stores
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
		})),
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
		activeCleanup = null;
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

				if (activeCleanup) {
					activeCleanup();
					activeCleanup = null;
				}
			}
		};
	}, []);

	const handleOptimize = useCallback(
		async (tech: string, forced: boolean = false) => {
			performance.mark("optimize-start");
			const solveStartMs = performance.now();

			if (isOptimizingActive) {
				Logger.warn("Optimization already in progress, ignoring request");

				return;
			}

			const initialGridState = useGridStore.getState();
			const isGridFull = Boolean(initialGridState.isGridFull);
			const hasTechInGrid = Boolean(initialGridState.activeTechs?.has?.(tech));
			const isCustomGrid =
				initialGridState.isDefaultGrid !== undefined ?
					!initialGridState.isDefaultGrid
				:	false;

			if (isGridFull && !hasTechInGrid) {
				useShakeStore.getState().triggerShake();

				return;
			}

			// Perform atomic pre-solve Technology Reset before reading the grid
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

			let isCleaningUp = false;
			let currentSocket: null | Socket = null;

			const cleanupSocket = () => {
				if (currentSocket) {
					currentSocket.off();
					currentSocket.disconnect();
					currentSocket = null;
				}
			};

			const cancelSolve = () => {
				isCleaningUp = true;
				cleanupSocket();
			};

			const finishSolve = () => {
				cancelSolve();
				resetProgress();
			};

			activeCleanup = cancelSolve;

			const connectAndSolve = async (retryCount: number): Promise<void> => {
				const nextSocket = await createSocket();

				if (isCleaningUp) {
					nextSocket?.off();
					nextSocket?.disconnect();

					return;
				}

				if (!nextSocket) {
					if (mountedCount > 0) {
						setShowErrorStore(
							true,
							"recoverable",
							new Error("Failed to initialize WebSocket connection"),
						);
					}

					finishSolve();

					return;
				}

				currentSocket = nextSocket;

				currentSocket.on(
					"progress",
					(data: {
						best_grid?: Grid;
						bestGrid?: Grid;
						progress_percent?: number;
						progressPercent?: number;
					}) => {
						if (isCleaningUp || mountedCount <= 0) return;
						const bestGrid = data.best_grid ?? data.bestGrid;
						const progressPercent = data.progress_percent ?? data.progressPercent ?? 0;
						setProgressPercent(progressPercent);
						if (bestGrid) setGrid(bestGrid);
					},
				);

				currentSocket.once("optimization_result", (data: Record<string, unknown>) => {
					if (isCleaningUp) return;

					const translatedData = parseOptimizationResult(data);

					if (translatedData) {
						if (translatedData.solveMethod === "Pattern No Fit" && !forced) {
							if (mountedCount > 0) {
								Logger.info(`Optimization "Pattern No Fit" for ${tech}`, {
									platform: selectedShipTypeRef.current,
									tech,
								});
								setPatternNoFitTech(tech);
								sendEventRef.current({
									action: "no_fit_warning",
									category: "ui",
									module_count: availableModules.length,
									nonInteraction: false,
									platform: selectedShipTypeRef.current,
									tech,
									value: 1,
								});
							}
						} else {
							performance.mark("optimize-complete");
							const measureEntry = performance.measure(
								"optimize-to-complete",
								"optimize-start",
								"optimize-complete",
							) as PerformanceMeasure | undefined;
							const solveDurationMs = Math.max(
								0,
								Math.round(
									measureEntry?.duration ?? performance.now() - solveStartMs,
								),
							);

							if (mountedCount > 0) {
								if (patternNoFitTechRef.current === tech) setPatternNoFitTech(null);

								Logger.info(`Optimization complete for ${tech}`, {
									bonus: translatedData.maxBonus,
									method: translatedData.solveMethod,
									tech,
								});

								sessionCoordinator.commitOptimizationResult(translatedData, tech);
								const techState = useTechStore.getState();
								const gridAfterCommit = useGridStore.getState();
								const gaTech = resolveAnalyticsTechName(
									tech,
									techState.checkedModules,
								);

								if (translatedData.grid) {
									sendEventRef.current({
										action: "optimize_tech",
										active_tech_count: gridAfterCommit.activeTechs?.size ?? 1,
										bonus_status: resolveSolveQuality(translatedData.maxBonus),
										category: "ui",
										forced,
										is_custom_grid: isCustomGrid,
										is_custom_modules:
											techState.isDefaultModuleSelection !== undefined ?
												!techState.isDefaultModuleSelection
											:	false,
										max_bonus:
											typeof translatedData.maxBonus === "number" ?
												Math.round(translatedData.maxBonus)
											:	undefined,
										module_count: availableModules.length,
										nonInteraction: false,
										platform: selectedShipTypeRef.current,
										solve_duration_ms: solveDurationMs,
										solve_method: translatedData.solveMethod,
										...(solveType ? { solve_type: solveType } : {}),
										supercharged:
											typeof translatedData.maxBonus === "number"
											&& translatedData.maxBonus > 100,
										tech: gaTech,
										value: 1,
									});
								}
							}
						}
					} else {
						Logger.error("Invalid API response format", { data });

						if (mountedCount > 0) {
							setShowErrorStore(
								true,
								"recoverable",
								new Error("Invalid API response format"),
							);
						}
					}

					finishSolve();
				});

				const handleError = (err: Error | unknown) => {
					if (isCleaningUp) return;

					const errMessage = err instanceof Error ? err.message : String(err);
					const isTransportError = TRANSPORT_ERROR_MESSAGES.has(errMessage);

					if (isTransportError && retryCount < MAX_TRANSPORT_RETRIES) {
						Logger.warn(
							`Optimization transport failure for ${tech} — retrying (${retryCount + 1}/${MAX_TRANSPORT_RETRIES})`,
							{ error: errMessage },
						);
						cleanupSocket();
						void connectAndSolve(retryCount + 1);

						return;
					}

					Logger.error(`Optimization WebSocket error for ${tech}`, err);
					const normalizedError = err instanceof Error ? err : new Error(String(err));

					if (mountedCount > 0) {
						setShowErrorStore(true, "recoverable", normalizedError);
					}

					finishSolve();
				};

				currentSocket.once("connect_error", handleError);
				currentSocket.once("error", handleError);

				currentSocket.on("disconnect", (reason: string) => {
					if (reason === "io client disconnect" || isCleaningUp) {
						return;
					}

					if (reason === "transport close") {
						Logger.info("Socket disconnected during optimization (transport close)", {
							reason,
						});
						finishSolve();

						return;
					}

					Logger.warn("Socket disconnected during optimization", { reason });
					handleError(new Error(`Disconnected: ${reason}`));
				});

				const emitOptimize = () => {
					if (!currentSocket || isCleaningUp) return;

					currentSocket.emit("optimize", {
						available_modules: availableModules,
						forced,
						grid,
						send_grid_updates: isLargeRef.current,
						ship,
						solve_type: solveType,
						tech,
					});
				};

				if (currentSocket.connected) {
					emitOptimize();
				} else {
					currentSocket.once("connect", emitOptimize);
				}
			};

			await connectAndSolve(0);
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
		],
	);

	const clearPatternNoFitTech = useCallback(
		() => setPatternNoFitTech(null),
		[setPatternNoFitTech],
	);

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
