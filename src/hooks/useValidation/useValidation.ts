import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { usePlatformStore } from "../../store/app/platformStore";
import { useDialog } from "../../utils/system/dialogUtils";

/**
 * Options for the `useDebouncedValidation` hook.
 */
interface UseDebouncedValidationOptions {
	/** Delay in milliseconds before the validation is executed. Defaults to `250`. */
	debounceMs?: number;
}

/**
 * Custom hook for executing validation logic with a debounce delay.
 *
 * @remarks
 * This is useful for validating user input (e.g., in a text field) without
 * triggering validation on every keystroke. It handles timer cleanup on unmount
 * to prevent memory leaks and state updates on unmounted components.
 *
 * @param {function(string): string|null} validator - A function that takes the current value and returns an error string or `null` if valid. **Must be a pure function.**
 * @param {UseDebouncedValidationOptions} [options={}] - Configuration for the debounce behavior.
 *
 * @returns {{ error: string|null, handleChange: function(string): void }} State containing the current error and a handler for input changes.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { error, handleChange } = useDebouncedValidation(
 *   (val) => (val.length < 3 ? "Too short" : null),
 *   { debounceMs: 500 }
 * );
 *
 * // handleChange("a"); // error remains null for 500ms
 * // ... after 500ms: error is "Too short"
 * ```
 */
export const useDebouncedValidation = (
	validator: (value: string) => null | string,
	{ debounceMs = 250 }: UseDebouncedValidationOptions = {}
) => {
	const [error, setError] = useState<null | string>(null);
	const debounceTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

	const handleChange = (value: string) => {
		// Clear existing timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Set new debounced validation
		debounceTimerRef.current = setTimeout(() => {
			setError(validator(value));
		}, debounceMs);
	};

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	return { error, handleChange };
};

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
		Array.from(currentParams.keys()).forEach((key) => {
			if (!allowedKeys.includes(key)) {
				currentParams.delete(key);
				changed = true;
			}
		});

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

/**
 * Custom hook that enforces URL normalization (trailing slashes and platform param).
 *
 * @remarks
 * This hook ensures that:
 * 1. Every URL path consistently ends with a slash to match the SSG directory structure.
 * 2. The `platform` query parameter is present if the user is returning or if already present.
 *
 * @returns {void} Side-effects only.
 *
 * @example
 * ```tsx
 * useUrlNormalization();
 * ```
 */
export const useUrlNormalization = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const selectedPlatform = usePlatformStore((s) => s.selectedPlatform);
	const { userVisited } = useDialog();

	useEffect(() => {
		const url = new URL(window.location.href);
		let changed = false;

		// 1. Ensure trailing slash
		// (skip if it's a file with an extension)
		const pathParts = url.pathname.split("/");
		const lastSegment = pathParts[pathParts.length - 1];

		if (!url.pathname.endsWith("/") && !lastSegment.includes(".")) {
			url.pathname += "/";
			changed = true;
		}

		// 2. Ensure platform param is present and matches store IF returning or already present
		const currentPlatformParam = url.searchParams.get("platform");

		if (currentPlatformParam !== selectedPlatform) {
			// Logic: Decorate URL only if user is returning OR if the URL already has a param
			// This keeps the URL clean for new users and bots.
			if (userVisited || currentPlatformParam !== null) {
				url.searchParams.set("platform", selectedPlatform);
				changed = true;
			}
		}

		if (changed) {
			// We use replace: true to avoid polluting history with normalization redirects
			navigate(url.pathname + url.search, { replace: true });
		}
	}, [location.pathname, selectedPlatform, navigate, userVisited]);
};
