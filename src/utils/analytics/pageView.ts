/**
 * Unified page-view, virtual screen, and inbound acquisition telemetry module.
 *
 * @remarks
 * Consolidates route-level `page_view` deduplication (`${lang}:${cleanPath}` per
 * [ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)),
 * SPA `page_referrer` chaining, inbound campaign/referral (`utm_*`, `ref`) parameter
 * capture prior to URL query sanitization, and virtual modal/error screen `page_view`
 * title formatting and tracking into a single deep module.
 *
 * @see {@link captureAcquisitionParams}
 * @see {@link trackRoutePageView}
 * @see {@link trackVirtualPageView}
 * @see {@link resetPageViewTracking}
 *
 * @category Utilities
 */

import type { AcquisitionParams, PageViewGA4Event } from "@/types/analytics";
import { sendDeferredEvent, sendEvent } from "@/utils/analytics/tracking";
import { formatDocumentTitle, formatErrorDocumentTitle } from "@shared/page-metadata.js";

const ACQUISITION_PARAM_KEYS = [
	"ref",
	"utm_campaign",
	"utm_content",
	"utm_medium",
	"utm_source",
	"utm_term",
] as const;

/**
 * Options for dispatching a canonical route `page_view` telemetry event.
 *
 * @category Utilities
 */
export interface RoutePageViewOptions {
	/** Canonical route path without language prefix (e.g., `"/"`, `"/instructions/"`). */
	cleanPath: string;
	/** Active ISO language code (e.g., `"en"`, `"fr"`). */
	lang: string;
	/** Full router path and query string (e.g., `"/?utm_source=reddit"`). */
	page: string;
	/** Resolved localized document `<title>`. */
	pageTitle: string;
	/** Raw URL search string to extract acquisition parameters from if not already captured. */
	search: string;
}

/**
 * Options for dispatching a non-interactive virtual screen or modal `page_view` event.
 *
 * @category Utilities
 */
export interface VirtualPageViewOptions {
	/** Localized application name used when formatting `topic` into `page_title`. */
	appName?: string;
	/** Whether to dispatch via `requestIdleCallback` (`sendDeferredEvent`) to protect INP. */
	deferred?: boolean;
	/** Optional HTTP error status code (e.g., `404`, `500`) when formatting an error `topic`. */
	errorCode?: number;
	/** Optional virtual fragment identifier without leading `#` (e.g., `"welcome"`, `"update"`). */
	hash?: string;
	/** Explicit page path override; defaults to `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ""}`. */
	page?: string;
	/** Pre-formatted localized modal or error screen document title (when already computed for `<title>`). */
	pageTitle?: string;
	/** Localized modal or error topic formatted via `formatDocumentTitle` / `formatErrorDocumentTitle` when `pageTitle` is omitted. */
	topic?: string;
}

/** Buffered inbound acquisition parameters captured before `useUrlSync` strips query keys. */
let capturedAcquisitionParams: AcquisitionParams | null = null;
/** Whether the initial landing route's acquisition parameters have already been consumed. */
let initialAcquisitionConsumed = false;
/** Last tracked `${lang}:${cleanPath}` route key for deduplicating query-only updates. */
let lastTrackedRouteKey: null | string = null;
/** Last tracked full URL (`window.location.href`) for chaining SPA `page_referrer`. */
let lastTrackedUrl: null | string = null;

/**
 * Extracts inbound campaign and referral query parameters (`utm_*`, `ref`) from a URL search string.
 *
 * @param search - Raw URL query string (e.g., `"?utm_source=reddit&utm_medium=post"`).
 *
 * @returns Extracted non-empty acquisition parameters truncated to 100 characters.
 */
const extractAcquisitionParams = (search: string): AcquisitionParams => {
	if (!search) return {};

	const params = new URLSearchParams(search);
	const extracted: AcquisitionParams = {};

	for (const key of ACQUISITION_PARAM_KEYS) {
		const value = params.get(key)?.trim();

		if (value) {
			extracted[key] = value.slice(0, 100);
		}
	}

	return extracted;
};

/**
 * Captures inbound campaign and referral query parameters (`utm_*`, `ref`) before URL sanitization.
 *
 * @remarks
 * Invoked by `useUrlSync` prior to stripping non-whitelisted query keys via
 * `window.history.replaceState` so the initial route `page_view` in `<Seo />`
 * retains landing attribution parameters. Once the initial route `page_view` has
 * consumed landing attribution, subsequent calls are ignored so parent/child
 * `useEffect` ordering cannot re-buffer stale parameters onto later navigations.
 *
 * @param search - Raw URL query string before sanitization.
 *
 * @returns Side-effects only.
 *
 * @see {@link AcquisitionParams}
 * @see {@link trackRoutePageView}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * captureAcquisitionParams("?utm_source=reddit&ref=sidebar");
 * // buffers { ref: "sidebar", utm_source: "reddit" } for the initial route page_view
 * ```
 */
export const captureAcquisitionParams = (search: string): void => {
	if (initialAcquisitionConsumed) {
		return;
	}

	const extracted = extractAcquisitionParams(search);

	if (Object.keys(extracted).length > 0) {
		capturedAcquisitionParams = {
			...capturedAcquisitionParams,
			...extracted,
		};
	}
};

/**
 * Dispatches a canonical route `page_view` event with deduplication, referrer chaining,
 * and inbound acquisition attribution.
 *
 * @remarks
 * Deduplicates by `${lang}:${cleanPath}` so `?platform=` and `?grid=` query parameter
 * updates do not emit duplicate `page_view` events ([ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 * Consumes any acquisition parameters buffered by {@link captureAcquisitionParams} on first dispatch.
 *
 * @param options - Route page-view options.
 *
 * @returns Side-effects only.
 *
 * @see {@link RoutePageViewOptions}
 * @see {@link captureAcquisitionParams}
 * @see {@link sendEvent}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * trackRoutePageView({
 *   cleanPath: "/",
 *   lang: "en",
 *   page: "/",
 *   pageTitle: "No Man's Sky Tech Layout & Adjacency Calculator | NMS Optimizer",
 *   search: "",
 * });
 * // returns void
 * ```
 */
export const trackRoutePageView = ({
	cleanPath,
	lang,
	page,
	pageTitle,
	search,
}: RoutePageViewOptions): void => {
	const routeKey = `${lang}:${cleanPath}`;

	if (lastTrackedRouteKey === routeKey) {
		lastTrackedUrl = window.location.href;

		return;
	}

	lastTrackedRouteKey = routeKey;

	const acquisitionParams: AcquisitionParams =
		initialAcquisitionConsumed ?
			extractAcquisitionParams(search)
		:	{
				...capturedAcquisitionParams,
				...extractAcquisitionParams(search),
			};
	capturedAcquisitionParams = null;
	initialAcquisitionConsumed = true;

	const pageReferrer = lastTrackedUrl ?? document.referrer;
	lastTrackedUrl = window.location.href;

	sendEvent({
		action: "page_view",
		category: "engagement",
		page,
		page_location: window.location.href,
		page_referrer: pageReferrer,
		page_title: pageTitle,
		...acquisitionParams,
	});
};

/**
 * Dispatches a non-interactive virtual `page_view` event for modals, dialogs, and error screens.
 *
 * @remarks
 * Standardizes all virtual screen views (`WelcomeDialog`, `UpdatePromptDialog`,
 * `ModuleSelectionDialog`, `NotFound`, and fatal error screens in `AppContent`) under
 * `category: "engagement"`, `nonInteraction: true`, and unified title formatting via
 * {@link formatDocumentTitle} / {@link formatErrorDocumentTitle}.
 *
 * @param options - Virtual page-view options.
 *
 * @returns Side-effects only.
 *
 * @see {@link VirtualPageViewOptions}
 * @see {@link formatDocumentTitle}
 * @see {@link formatErrorDocumentTitle}
 * @see {@link sendEvent}
 * @see {@link sendDeferredEvent}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * trackVirtualPageView({ appName: "NMS Optimizer", hash: "welcome", topic: "Welcome" });
 * // returns void
 * ```
 */
export const trackVirtualPageView = ({
	appName = "NMS Optimizer",
	deferred = false,
	errorCode,
	hash,
	page,
	pageTitle,
	topic,
}: VirtualPageViewOptions): void => {
	const resolvedPage =
		page ?? `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ""}`;
	const resolvedTitle =
		pageTitle
		?? (typeof errorCode === "number" ?
			formatErrorDocumentTitle(errorCode, topic ?? "", appName)
		:	formatDocumentTitle(topic ?? "", appName));
	const pageReferrer = lastTrackedUrl ?? document.referrer;

	const event: PageViewGA4Event = {
		action: "page_view",
		category: "engagement",
		nonInteraction: true,
		page: resolvedPage,
		page_location: window.location.href,
		...(pageReferrer ? { page_referrer: pageReferrer } : {}),
		page_title: resolvedTitle,
	};

	if (deferred) {
		sendDeferredEvent(event);
	} else {
		sendEvent(event);
	}
};

/**
 * Resets in-memory route deduplication, referrer history, and buffered acquisition state.
 *
 * @remarks
 * Invoked when `<Seo />` unmounts or between unit tests so subsequent mounts evaluate
 * fresh `document.referrer` and initial route keys.
 *
 * @returns Side-effects only.
 *
 * @see {@link trackRoutePageView}
 * @see {@link captureAcquisitionParams}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * resetPageViewTracking();
 * // returns void
 * ```
 */
export const resetPageViewTracking = (): void => {
	capturedAcquisitionParams = null;
	initialAcquisitionConsumed = false;
	lastTrackedRouteKey = null;
	lastTrackedUrl = null;
};
