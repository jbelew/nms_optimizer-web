import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
 * @see {@link useNavigate} for performing the redirection.
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
	const navigate = useNavigate();

	useEffect(() => {
		const currentParams = new URLSearchParams(location.search);

		if (currentParams.has("grid") && !currentParams.has("platform")) {
			// Invalid shared URL: grid is present but platform is missing
			currentParams.delete("grid"); // Remove the grid param
			// Navigate to the cleaned URL
			navigate(`${location.pathname}?${currentParams.toString()}`, { replace: true });
		}
	}, [location.pathname, location.search, navigate]);
};
