import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook for validating URL query parameters and enforcing data integrity.
 *
 * @remarks
 * It specifically checks for edge cases in shared links, such as when a `grid`
 * parameter exists without a corresponding `platform` parameter. If invalid
 * combinations are detected, it automatically sanitizes the URL and redirects
 * the user using a `replace` navigation.
 *
 * It acts as a safety gate for deep-linked application states.
 *
 * @returns {void} Side-effects only; manages URL sanitization.
 *
 * @see {@link useLocation} for monitoring URL changes.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const App = () => {
 *   // Typically called at the root to ensure valid initial state
 *   useUrlValidation();
 *
 *   return <Routes>...</Routes>;
 * };
 * ```
 */
export const useUrlValidation = () => {
	const location = useLocation();

	useEffect(() => {
		const currentParams = new URLSearchParams(location.search);
		const allowedKeys = ["platform", "grid"];
		let changed = false;

		// 1. Strip junk parameters and mangled paths
		// We only keep keys that are in our whitelist.
		const allKeys = Array.from(currentParams.keys());

		for (const key of allKeys) {
			if (!allowedKeys.includes(key)) {
				currentParams.delete(key);
				changed = true;
			}
		}

		// 2. Validate data integrity: grid requires platform
		if (currentParams.has("grid") && !currentParams.has("platform")) {
			// Invalid shared URL: grid is present but platform is missing
			currentParams.delete("grid");
			changed = true;
		}

		if (changed) {
			// Construct the normalized search string
			const search = currentParams.toString();
			const searchSuffix = search ? `?${search}` : "";

			// We use replaceState directly to bypass any "navigate" restrictions (like bot checks)
			// and ensure the URL is cleaned immediately.
			const newUrl = `${location.pathname}${searchSuffix}`;
			window.history.replaceState({}, "", newUrl);
		}
	}, [location.pathname, location.search]);
};
