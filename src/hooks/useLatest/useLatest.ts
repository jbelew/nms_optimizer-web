import { useLayoutEffect, useRef } from "react";

/**
 * Custom hook that returns a ref containing the most recent value passed to it.
 *
 * This is particularly useful for accessing the latest state or props within
 * asynchronous callbacks or effects without needing to include them in the
 * dependency array, thus avoiding unnecessary effect re-executions.
 *
 * @template T - The type of the value being tracked.
 * @param {T} value - The value to store in the ref.
 * @returns {React.MutableRefObject<T>} A ref object whose `.current` property matches the latest `value`.
 *
 * @example
 * const latestValue = useLatest(count);
 * useEffect(() => {
 *   const timer = setInterval(() => console.log(latestValue.current), 1000);
 *   return () => clearInterval(timer);
 * }, []);
 */
export function useLatest<T>(value: T) {
	const ref = useRef(value);

	useLayoutEffect(() => {
		ref.current = value;
	});

	return ref;
}
