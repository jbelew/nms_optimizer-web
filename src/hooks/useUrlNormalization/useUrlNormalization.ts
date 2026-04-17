import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { usePlatformStore } from "../../store/app/platformStore";
import { useDialog } from "../../utils/system/dialogUtils";

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
