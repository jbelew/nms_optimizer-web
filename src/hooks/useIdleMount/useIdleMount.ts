import { useEffect, useState } from "react";

/**
 * Custom hook that defers mounting of children until the browser is idle.
 *
 * @param {number} [timeout=2000] - Maximum time to wait before forcing a mount.
 * @param {number} [delay=1000] - Fallback timeout if requestIdleCallback is not supported.
 *
 * @returns {boolean} Whether the component should mount.
 *
 * @example
 * ```tsx
 * const shouldMount = useIdleMount();
 * if (!shouldMount) return null;
 * return <HeavyComponent />;
 * ```
 */
export function useIdleMount(timeout: number = 2000, delay: number = 1000): boolean {
	const [mount, setMount] = useState(false);

	useEffect(() => {
		let handle: number | undefined;

		if ("requestIdleCallback" in window) {
			handle = window.requestIdleCallback(() => setMount(true), { timeout });
		} else {
			handle = setTimeout(() => setMount(true), delay) as unknown as number;
		}

		return () => {
			if (handle !== undefined) {
				if ("cancelIdleCallback" in window) {
					window.cancelIdleCallback(handle);
				} else {
					clearTimeout(handle);
				}
			}
		};
	}, [timeout, delay]);

	return mount;
}
