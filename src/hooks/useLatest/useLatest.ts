import { useLayoutEffect, useRef } from "react";

/**
 * Custom hook that returns a ref containing the most recent value passed to it.
 *
 * @remarks
 * This is particularly useful for accessing the latest state or props within
 * asynchronous callbacks or effects without needing to include them in the
 * dependency array, thus avoiding unnecessary effect re-executions.
 *
 * @template T - The type of the value being tracked.
 *
 * @param {T} value - The value to store in the ref.
 *
 * @returns {import('react').MutableRefObject<T>} A ref object whose `.current` property matches the latest `value`.
 *
 * @hook
 *
 * @category Utility Hooks
 *
 * @example Accessing latest state in a timer
 * ```tsx
 * const count = 5;
 * const latestValue = useLatest(count);
 *
 * useEffect(() => {
 *   const timer = setInterval(() => {
 *     // Always logs the most recent count, even if this effect doesn't re-run
 *     console.log(latestValue.current);
 *   }, 1000);
 *   return () => clearInterval(timer);
 * }, [latestValue]); // Only depends on the stable ref
 * ```
 */
export function useLatest<T>(value: T) {
	const ref = useRef(value);

	useLayoutEffect(() => {
		ref.current = value;
	});

	return ref;
}
