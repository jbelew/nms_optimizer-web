import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { usePlatformsSuspense, usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useDialog } from "@/utils/system/dialogUtils";
import { Logger } from "@/utils/system/monitoring";

const ALLOWED_URL_QUERY_KEYS = ["platform", "grid"];

/**
 * Sanitizes URL query parameters by stripping non-whitelisted keys and removing
 * orphaned `grid` parameters when `platform` is missing.
 *
 * @param pathname - The URL pathname to preserve.
 * @param search - The raw query string to validate.
 *
 * @returns The sanitized search string (including leading `?` if non-empty).
 */
const sanitizeUrlSearchParams = (pathname: string, search: string): string => {
	const currentParams = new URLSearchParams(search);
	let changed = false;

	Array.from(currentParams.keys()).forEach((key) => {
		if (!ALLOWED_URL_QUERY_KEYS.includes(key)) {
			currentParams.delete(key);
			changed = true;
		}
	});

	if (currentParams.has("grid") && !currentParams.has("platform")) {
		currentParams.delete("grid");
		changed = true;
	}

	if (changed) {
		const normalizedSearch = currentParams.toString();
		const searchSuffix = normalizedSearch ? `?${normalizedSearch}` : "";
		const newUrl = `${pathname}${searchSuffix}`;
		window.history.replaceState({}, "", newUrl);

		return searchSuffix;
	}

	return search;
};

/**
 * Root lifecycle hook for validating, normalizing, and synchronizing browser URL state
 * with application stores.
 *
 * @remarks
 * Consolidates URL query sanitization, initial state restoration, `popstate` history
 * navigation, trailing-slash/`?platform=` normalization, and **Shared Grid** reset
 * URL cleanup into a single deterministic pipeline mounted once at the application root.
 *
 * Responsibilities:
 * 1. **Query Validation**: Strips unknown query parameters and removes `grid` if `platform` is absent.
 * 2. **State Restoration & History Sync**: Restores `platform` and `grid` via {@link sessionCoordinator.syncStateFromUrl} on mount and `popstate`.
 * 3. **URL Normalization**: Enforces trailing slashes on non-file paths and keeps `?platform=` synchronized for returning users or deep links.
 * 4. **Shared Grid Reset**: Pushes a clean URL (`replace: false`) removing `?grid=` when a **Shared Grid** is reset.
 *
 * @returns Imperative helpers for share URL generation and reset URL cleanup.
 *
 * @see {@link sessionCoordinator}
 * @see {@link usePlatformStore}
 * @see {@link useGridStore}
 * @see {@link ./useUrlSync.test.tsx Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const AppContent = () => {
 *   useUrlSync();
 *   return <Outlet />;
 * };
 * // mounts root URL sync lifecycle and returns { updateUrlForReset, updateUrlForShare }
 * ```
 */
export const useUrlSync = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const platforms = usePlatformsSuspense();

	const { userVisited } = useDialog();

	const pathname = location?.pathname ?? window.location.pathname;
	const search = location?.search ?? window.location.search;

	const isSyncingRef = useRef(false);
	const platformsRef = useRef(platforms);
	const prevIsSharedGridRef = useRef(isSharedGrid);

	useEffect(() => {
		platformsRef.current = platforms;
	}, [platforms]);

	/**
	 * Removes the `grid` query parameter from the URL when resetting a Shared Grid.
	 *
	 * @remarks
	 * Pushes a new history entry (`replace: false`) so the user can navigate Back
	 * to recover the shared layout. If the URL does not contain a `grid` parameter,
	 * skips router navigation completely.
	 *
	 * @returns {void}
	 *
	 * @example
	 * ```ts
	 * updateUrlForReset();
	 * // navigates to pathname + search without ?grid=
	 * ```
	 */
	const updateUrlForReset = useCallback(() => {
		try {
			const url = new URL(window.location.href);
			if (!url.searchParams.has("grid")) return;

			url.searchParams.delete("grid");
			navigate(url.pathname + url.search, { replace: false });
		} catch (error) {
			Logger.warn("useUrlSync: Failed to update URL for reset", { error });
		}
	}, [navigate]);

	// 1. Validate and sanitize query parameters on route/search changes
	useEffect(() => {
		sanitizeUrlSearchParams(pathname, search);
	}, [pathname, search]);

	// 2. Restore state from URL on mount and handle browser Back/Forward (popstate)
	useEffect(() => {
		const handlePopState = async () => {
			if (isSyncingRef.current) return;

			let urlParams: URLSearchParams;

			try {
				const sanitizedSearch = sanitizeUrlSearchParams(
					window.location.pathname,
					window.location.search
				);
				urlParams = new URLSearchParams(sanitizedSearch);
			} catch (e) {
				Logger.warn("useUrlSync: Failed to parse URL search params", { error: e });

				return;
			}

			const platformFromUrl = urlParams.get("platform");
			const gridFromUrl = urlParams.get("grid");

			const currentPlatforms = platformsRef.current;

			if (!currentPlatforms || Object.keys(currentPlatforms).length === 0) {
				Logger.warn("useUrlSync: Platform catalog not loaded yet, deferring URL sync");

				return;
			}

			isSyncingRef.current = true;

			try {
				const syncResult = sessionCoordinator.syncStateFromUrl({
					gridFromUrl,
					platformFromUrl,
				});

				if (syncResult instanceof Promise) {
					await syncResult;
				}
			} catch (error) {
				Logger.warn("useUrlSync: Failed to sync state from URL", { error });
			} finally {
				isSyncingRef.current = false;
			}
		};

		if (!isSyncingRef.current) {
			void handlePopState();
		}

		const onPopState = () => {
			void handlePopState();
		};

		window.addEventListener("popstate", onPopState, { passive: true });

		return () => {
			window.removeEventListener("popstate", onPopState);
		};
	}, []);

	// 3. Automatically clean up ?grid= parameter when a Shared Grid is reset
	useEffect(() => {
		if (prevIsSharedGridRef.current && !isSharedGrid && !isSyncingRef.current) {
			updateUrlForReset();
		}

		prevIsSharedGridRef.current = isSharedGrid;
	}, [isSharedGrid, updateUrlForReset]);

	// 4. Normalize URL trailing slashes and ?platform= parameter
	useEffect(() => {
		if (!pathname) return;
		const url = new URL(window.location.href);
		let changed = false;

		const pathParts = url.pathname.split("/");
		const lastSegment = pathParts[pathParts.length - 1];

		if (!url.pathname.endsWith("/") && !lastSegment.includes(".")) {
			url.pathname += "/";
			changed = true;
		}

		const currentPlatformParam = url.searchParams.get("platform");
		const effectivePlatform =
			usePlatformStore.getState?.()?.selectedPlatform ?? selectedPlatform;

		if (currentPlatformParam !== effectivePlatform) {
			if (userVisited || currentPlatformParam !== null) {
				url.searchParams.set("platform", effectivePlatform);
				changed = true;
			}
		}

		if (changed) {
			navigate(url.pathname + url.search, { replace: true });
		}
	}, [pathname, selectedPlatform, navigate, userVisited]);

	/**
	 * Generates a full URL including the current Platform Type and serialized Shared Grid state.
	 *
	 * @returns {string} The shareable URL.
	 *
	 * @example
	 * ```ts
	 * const url = updateUrlForShare();
	 * // => "https://nms-optimizer.app/?platform=standard&grid=..."
	 * ```
	 */
	const updateUrlForShare = useCallback(() => {
		return sessionCoordinator.getShareUrl();
	}, []);

	return { updateUrlForReset, updateUrlForShare };
};
