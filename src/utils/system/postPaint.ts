import { useCallback, useEffect, useRef } from "react";

/**
 * Callback signature returned by {@link useAfterNextPaint} for slot-scoped post-paint scheduling.
 *
 * @category Hooks
 */
export type AfterNextPaintScheduler = (callback: () => void, slot?: string) => void;

/**
 * Schedules `callback` to execute in a macrotask immediately after the browser's next paint frame.
 *
 * @remarks
 * Pairs `requestAnimationFrame` with `setTimeout(..., 0)` so the current input interaction
 * completes its visual frame paint before heavy Zustand (`useSyncExternalStore`) store updates
 * or modal mounts execute (per ADR-0005). Falls back to `setTimeout(..., 0)` in non-browser
 * environments without `requestAnimationFrame`.
 *
 * @param callback - Work to invoke after the upcoming animation frame paints.
 *
 * @returns Cancellation function that aborts the pending animation frame or macrotask.
 *
 * @see {@link useAfterNextPaint}
 * @see {@link ./postPaint.test.ts Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const cancel = scheduleAfterNextPaint(() => openDialog(data));
 * // schedules openDialog after next paint and returns cancel()
 * ```
 */
export function scheduleAfterNextPaint(callback: () => void): () => void {
	let cancelled = false;
	let rafId: null | number = null;
	let timeoutId: null | ReturnType<typeof setTimeout> = null;

	const runMacrotask = () => {
		rafId = null;
		timeoutId = setTimeout(() => {
			timeoutId = null;

			if (!cancelled) {
				callback();
			}
		}, 0);
	};

	if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
		rafId = window.requestAnimationFrame(runMacrotask);
	} else {
		runMacrotask();
	}

	return () => {
		cancelled = true;

		if (
			rafId !== null
			&& typeof window !== "undefined"
			&& typeof window.cancelAnimationFrame === "function"
		) {
			window.cancelAnimationFrame(rafId);
			rafId = null;
		}

		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};
}

/**
 * React hook returning a slot-keyed, latest-wins post-paint scheduler that auto-cancels on unmount.
 *
 * @remarks
 * Scheduling a new callback under an active `slot` cancels any superseded pending callback in
 * that slot so rapid double-taps within ~16ms never execute stale or duplicate actions. All
 * pending slots are canceled automatically when the host component unmounts.
 *
 * @returns Stable slot-scoped scheduling function.
 *
 * @see {@link AfterNextPaintScheduler}
 * @see {@link scheduleAfterNextPaint}
 * @see {@link ./postPaint.test.ts Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const runAfterPaint = useAfterNextPaint();
 * runAfterPaint(() => sessionCoordinator.resetSession(), "reset");
 * // runs resetSession after next paint and cancels if unmounted
 * ```
 */
export function useAfterNextPaint(): AfterNextPaintScheduler {
	const cancelMapRef = useRef<Map<string, () => void>>(new Map());

	useEffect(() => {
		const activeMap = cancelMapRef.current;

		return () => {
			for (const cancel of activeMap.values()) {
				cancel();
			}

			activeMap.clear();
		};
	}, []);

	return useCallback((callback: () => void, slot = "default") => {
		const activeMap = cancelMapRef.current;
		activeMap.get(slot)?.();

		const cancel = scheduleAfterNextPaint(() => {
			activeMap.delete(slot);
			callback();
		});

		activeMap.set(slot, cancel);
	}, []);
}
