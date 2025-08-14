import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Custom hook for validating URL parameters and performing necessary redirections.
 * This hook checks for invalid combinations of URL parameters (e.g., `grid` without `platform`)
 * and corrects the URL by navigating to a cleaned version.
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
