import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { usePlatformStore } from "../../store/PlatformStore";

/**
 * Custom hook that enforces URL normalization (trailing slashes and platform param).
 *
 * @remarks
 * This hook ensures that:
 * 1. Every URL path consistently ends with a slash to match the SSG directory structure.
 * 2. The `platform` query parameter is always present, restoring it from the store if missing.
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

		// 2. Ensure platform param is present and matches store
		if (url.searchParams.get("platform") !== selectedPlatform) {
			url.searchParams.set("platform", selectedPlatform);
			changed = true;
		}

		if (changed) {
			// We use replace: true to avoid polluting history with normalization redirects
			navigate(url.pathname + url.search, { replace: true });
		}
	}, [location.pathname, selectedPlatform, navigate]);
};
