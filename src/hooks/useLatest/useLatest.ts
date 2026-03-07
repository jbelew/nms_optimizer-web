import { useLayoutEffect, useRef } from "react";

/**
 * A hook that returns a ref with the latest value.
 * Useful for accessing the latest state in callbacks without adding it as a dependency.
 *
 * @template T
 * @param {T} value - The value to track.
 * @returns {React.MutableRefObject<T>} A ref object containing the latest value.
 */
export function useLatest<T>(value: T) {
	const ref = useRef(value);

	useLayoutEffect(() => {
		ref.current = value;
	});

	return ref;
}
