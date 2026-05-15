import type { ApiResponse, Cell, Grid } from "../../store/grid/gridStore";
import type { Socket } from "socket.io-client";

import { usePlatformStore } from "../../store/app/platformStore";
import { createEmptyCell, useGridStore } from "../../store/grid/gridStore";
import { useTechStore } from "../../store/tech/techStore";
import { createSocket, TRANSPORT_ERROR_MESSAGES } from "../api/socketManager";
import { Logger } from "../system/monitoring";

/** Maximum number of silent transport-error retries before showing the error modal. */
export const MAX_TRANSPORT_RETRIES = 2;

/**
 * Options for configuring an optimization request.
 */
export interface OptimizationOptions {
	/** If true, bypasses pattern matching and uses advanced solvers immediately. */
	forced?: boolean;
	/** Whether to send periodic grid updates during long solves. */
	isLarge?: boolean;
	/** Callback for successful completion. */
	onComplete: (data: ApiResponse) => void;
	/** Callback for handled errors. */
	onError: (error: Error) => void;
	/** Callback when a pattern-no-fit result is encountered. */
	onPatternNoFit: () => void;
	/** Callback for progress updates. */
	onProgress: (data: { best_grid?: Grid; progress_percent: number }) => void;
	/** Internal retry counter for transport errors. */
	retryCount?: number;
	/** The unique identifier for the technology to optimize. */
	tech: string;
}

/**
 * Manages the optimization WebSocket lifecycle and retry logic.
 * Extracted from useOptimize for better testability and SoC.
 *
 * @category Utilities
 */
export class OptimizationManager {
	/** Flag to prevent callbacks firing during teardown. */
	private isCleaningUp = false;
	/** Configuration options for the current solve. */
	private options: OptimizationOptions;
	/** The current WebSocket instance. */
	private socket: null | Socket = null;

	/**
	 * Initializes a new manager instance.
	 *
	 * @param {OptimizationOptions} options - Solvers configuration and callbacks.
	 *
	 * @example
	 * ```ts
	 * const manager = new OptimizationManager(options);
	 * ```
	 */
	constructor(options: OptimizationOptions) {
		this.options = {
			forced: false,
			isLarge: false,
			retryCount: 0,
			...options,
		};
	}

	/**
	 * Tears down the WebSocket connection and removes listeners.
	 *
	 * @returns {void}
	 *
	 * @example
	 * ```ts
	 * manager.cleanup();
	 * ```
	 */
	public cleanup() {
		this.isCleaningUp = true;

		if (this.socket) {
			this.socket.off(); // Remove all listeners
			this.socket.disconnect();
			this.socket = null;
		}
	}

	/**
	 * Connects to the server and initiates the optimization request.
	 *
	 * @returns {void}
	 *
	 * @example
	 * ```ts
	 * manager.start();
	 * ```
	 */
	public start() {
		const { forced, isLarge, retryCount = 0, tech } = this.options;
		const { activeGroups, checkedModules, techGroups } = useTechStore.getState();
		const selectedShipType = usePlatformStore.getState().selectedPlatform;

		this.socket = createSocket();

		if (!this.socket) {
			this.options.onError(new Error("Failed to initialize WebSocket connection"));

			return;
		}

		this.socket.on("progress", (data) => {
			if (this.isCleaningUp) return;
			this.options.onProgress(data);
		});

		this.socket.once("optimization_result", (data: unknown) => {
			if (this.isCleaningUp) return;

			if (isApiResponse(data)) {
				if (data.solve_method === "Pattern No Fit" && !forced) {
					this.options.onPatternNoFit();
				} else {
					this.options.onComplete(data);
				}
			} else {
				this.options.onError(new Error("Invalid API response format"));
			}

			this.cleanup();
		});

		const handleError = (err: Error | unknown) => {
			if (this.isCleaningUp) return;

			const errMessage = err instanceof Error ? err.message : String(err);
			const isTransportError = TRANSPORT_ERROR_MESSAGES.has(errMessage);

			if (isTransportError && retryCount < MAX_TRANSPORT_RETRIES) {
				Logger.warn(
					`Optimization transport failure for ${tech} — retrying (${retryCount + 1}/${MAX_TRANSPORT_RETRIES})`,
					{ error: errMessage }
				);
				this.cleanup();

				// Re-start with incremented retry count
				const nextRetryOptions = {
					...this.options,
					retryCount: retryCount + 1,
				};
				new OptimizationManager(nextRetryOptions).start();

				return;
			}

			Logger.error(`Optimization WebSocket error for ${tech}`, err);
			this.options.onError(err instanceof Error ? err : new Error(String(err)));
			this.cleanup();
		};

		this.socket.once("connect_error", handleError);
		this.socket.once("error", handleError);

		this.socket.on("disconnect", (reason: string) => {
			if (reason === "io client disconnect" || this.isCleaningUp) {
				return;
			}

			const isTransportClose = reason === "transport close";

			if (isTransportClose) {
				Logger.info("Socket disconnected during optimization (transport close)", {
					reason,
				});
				// Even for transport close, we must notify the hook to reset its 'solving' state,
				// otherwise the UI hangs in a solving state.
				this.options.onError(new Error("Socket disconnected (transport close)"));
			} else {
				Logger.warn("Socket disconnected during optimization", { reason });
				handleError(new Error(`Disconnected: ${reason}`));
			}

			this.cleanup();
		});

		const solve_type = techGroups[tech]?.length > 1 ? activeGroups[tech] : undefined;

		const emitOptimize = () => {
			if (!this.socket || this.isCleaningUp) return;

			const { grid } = useGridStore.getState();
			const updatedGrid: Grid = {
				...grid,
				cells: grid.cells.map((row: Cell[]) => {
					let rowChanged = false;
					const newRow = row.map((cell: Cell) => {
						if (cell.tech === tech) {
							rowChanged = true;

							return { ...createEmptyCell(cell.supercharged, cell.active) };
						}

						return cell;
					});

					return rowChanged ? newRow : row;
				}),
			};

			const payload = {
				available_modules: checkedModules[tech] || [],
				forced,
				grid: updatedGrid,
				send_grid_updates: isLarge,
				ship: selectedShipType,
				solve_type,
				tech,
			};

			this.socket.emit("optimize", payload);
		};

		if (this.socket.connected) {
			emitOptimize();
		} else {
			this.socket.once("connect", emitOptimize);
		}
	}
}

/**
 * Validates that a value conforms to the `ApiResponse` structure.
 *
 * @param {unknown} value - The value to validate.
 *
 * @returns {value is ApiResponse} True if valid.
 *
 * @example
 * ```ts
 * if (isApiResponse(data)) { ... }
 * ```
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
