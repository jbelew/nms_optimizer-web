/**
 * Analytics utility module for Google Analytics 4 (GA4) and Core Web Vitals.
 *
 * @remarks
 * Provides a unified telemetry interface supporting direct client-side `window.gtag` dispatch
 * and a server-side Measurement Protocol relay (`/api/events`) when client-side tracking is
 * blocked by ad blockers or DNS sinkholes.
 *
 * Encapsulates:
 * - Disabled, non-production hostname, and bot/crawler guards across both client and server-relay paths.
 * - Client ID resolution (`_ga` cookie, `localStorage`, or generated `web_<ts>_<rand>`) shared across transports.
 * - Rolling 30-minute GA4 `session_id` (`_ga_<container>` cookie or `sessionStorage`) and foreground `engagement_time_msec` tracking so server-relayed events attribute sessions, entrances, and active users in GA4.
 * - Synchronized `user_properties` (`app_version`, `is_installed`, `platform_type`) and `app_version` event parameters across both client and server transports.
 * - Real-time `appinstalled` PWA installation listener updating `is_installed` and emitting `app_installed`.
 * - Multi-probe ad-blocker detection with a 3-second timeout safeguard.
 * - Pre-initialization event buffering and early `visibilitychange` / `pagehide` flushing (including Safari/WebKit `pagehide` before `visibilityState === "hidden"`).
 * - Boolean parameter normalization (`"true"` / `"false"`) for BigQuery parity ([ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 * - Core Web Vitals (`CLS`, `INP`, `FCP`, `LCP`, `TTFB`) observer registration and normalized DOM attribution (`#grid-cell`, Radix primitive filtering).
 *
 * @see {@link initializeAnalytics}
 * @see {@link sendEvent}
 * @see {@link sendDeferredEvent}
 * @see {@link buildExceptionEvent}
 * @see {@link syncAnalyticsPlatformProperty}
 *
 * @category Utilities
 */

import type {
	CLSMetricWithAttribution,
	INPMetricWithAttribution,
	LCPMetricWithAttribution,
	Metric,
	TTFBMetricWithAttribution,
} from "web-vitals/attribution";

import type { AnalyticsEventParams, GA4Event, PerformanceMetricGA4Event } from "@/types/analytics";
import { API_URL, TRACKING_ID } from "@/constants";
import { isBot, isStandalone, safeGetItem, safeSetItem } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

declare const __APP_VERSION__: string;

export type { GA4Event };

/**
 * Payload sent to the backend `/api/events` endpoint for server-side Measurement Protocol relay.
 */
interface AnalyticsEventPayload {
	/** Unique client identifier matching `_ga` / `analytics_client_id`. */
	clientId: string;
	/** Validated GA4 event name. */
	eventName: string;
	/** Event-specific parameters including `session_id`, `engagement_time_msec`, and page context. */
	params?: AnalyticsEventParams;
	/** Optional authenticated user ID. */
	userId?: string;
	/** User-scoped properties forwarded to Measurement Protocol `user_properties`. */
	userProperties?: AnalyticsUserProperties;
}

/**
 * User-scoped GA4 properties synchronized across `gtag` and `/api/events`.
 */
interface AnalyticsUserProperties {
	/** Semantic application version (`__APP_VERSION__`). */
	app_version: string;
	/** Whether the web app is running in standalone/installed PWA mode (`"yes"` or `"no"`). */
	is_installed: "no" | "yes";
	/** Active Platform Type identifier (e.g., `"standard"`, `"corvette"`). */
	platform_type: string;
}

/**
 * Rolling 30-minute GA4 session state persisted in `sessionStorage` when `_ga_<container>` cookies are unavailable.
 */
interface StoredSessionState {
	/** Epoch timestamp (ms) of the most recent analytics event in this session. */
	lastActivityMs: number;
	/** Numeric GA4 session ID (epoch seconds at session start). */
	sessionId: number;
	/** Monotonically increasing session counter for the tab. */
	sessionNumber: number;
}

/** GA4 default session inactivity window (30 minutes in milliseconds). */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
/** `sessionStorage` key storing rolling GA4 session metadata for server-relayed traffic. */
const SESSION_STORAGE_KEY = "analytics_session_state";
/** Matches coordinate-indexed grid cell DOM IDs (e.g., `grid-cell-0-0`, `grid-cell-5-9`). */
const GRID_CELL_ID_PATTERN = /^grid-cell-\d+-\d+$/;
/** Maximum length for generated Web Vitals target selectors. */
const MAX_SELECTOR_LENGTH = 100;
/** DOM `Node.ELEMENT_NODE` constant (`1`). */
const ELEMENT_NODE = 1;
/** DOM `Node.DOCUMENT_NODE` constant (`9`). */
const DOCUMENT_NODE = 9;

/** Event queue for events dispatched before transport detection settles. */
let queuedEvents: GA4Event[] = [];
/** Flag indicating if GA4 transport initialization has completed. */
let gaInitialized = false;
/** Flag indicating if client-side `window.gtag` has been configured for the active session. */
let gtagConfigured = false;
/** Flag indicating if `pagehide` / `visibilitychange` flush listeners have been attached. */
let hideListenersRegistered = false;
/** Flag indicating if `appinstalled` PWA listener has been attached. */
let appInstalledListenerRegistered = false;
/** Flag indicating if pre-unmount interaction target listeners have been attached. */
let interactionCaptureListenersRegistered = false;
/** Flag indicating if visibility/engagement tracking has been attached. */
let visibilityWatcherRegistered = false;
/** Earliest timestamp (ms from time origin) at which the document was hidden, or `-1` before initialization. */
let firstHiddenTime = -1;
/** Epoch timestamp (ms) when the current foreground engagement slice started, or `null` while hidden. */
let lastEngagementCheckpointMs: null | number = null;
/** Accumulated foreground engagement duration (ms) waiting to be flushed on the next server-relayed event. */
let accumulatedEngagementMs = 0;
/** In-memory fallback session state when `sessionStorage` is unavailable. */
let memorySessionState: null | StoredSessionState = null;
/** Most recent pre-unmount DOM selector captured on `pointerdown` or `keydown`. */
let lastInteractedTargetSelector = "";
/** Cached promise for ad-blocker detection. */
let adBlockerDetectionPromise: null | Promise<boolean> = null;
/** Cached result of ad-blocker detection. */
let adBlockerResult: boolean | null = null;
/** Active client ID for the session. */
let clientId = "";
/** Cached active Platform Type synchronized with `platformStore`. */
let currentPlatformType: null | string = null;
/** Cached standalone/installed PWA state updated dynamically on `appinstalled`. */
let isInstalledState: boolean | null = null;

/**
 * Resolves the current semantic application version string safely across build and test environments.
 *
 * @returns Semantic application version string.
 */
const getAppVersion = (): string =>
	typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0";

/**
 * Resolves whether the application is currently installed or running in standalone PWA mode.
 *
 * @returns `true` if running as an installed standalone PWA (including iOS Home Screen) or after `appinstalled`.
 */
const getIsInstalled = (): boolean => {
	if (isInstalledState === null) {
		isInstalledState = isStandalone();
	}

	return isInstalledState;
};

/**
 * Resolves the active Platform Type for user-property attribution.
 *
 * @returns Active Platform Type identifier (defaults to `"standard"`).
 */
const getActivePlatformType = (): string => {
	if (!currentPlatformType) {
		currentPlatformType = safeGetItem("selectedPlatform") || "standard";
	}

	return currentPlatformType;
};

/**
 * Builds the canonical user-scoped GA4 properties shared by `gtag` and `/api/events`.
 *
 * @returns Normalized user properties object.
 */
const getUserProperties = (): AnalyticsUserProperties => ({
	app_version: getAppVersion(),
	is_installed: getIsInstalled() ? "yes" : "no",
	platform_type: getActivePlatformType(),
});

/**
 * Ensures `window.dataLayer` and `window.gtag` exist so `gtag.js` binds cleanly upon script load.
 *
 * @returns Active `window.gtag` command dispatcher.
 */
const ensureGtagFunction = (): ((command: string, ...args: unknown[]) => void) => {
	window.dataLayer = window.dataLayer || [];

	if (typeof window.gtag !== "function") {
		window.gtag = function gtag() {
			window.dataLayer?.push(arguments);
		};
	}

	return window.gtag;
};

/**
 * Determines whether a hostname belongs to a local loopback or preview deployment environment.
 *
 * @param hostname - Browser `window.location.hostname` value.
 *
 * @returns `true` for loopback (`localhost`, `127.0.0.1`, `[::1]`) and preview (`*.pages.dev`, `*.herokuapp.com`) hosts.
 */
const isNonProductionHost = (hostname: string | undefined): boolean => {
	if (!hostname) return false;

	const normalized = hostname.toLowerCase();

	return (
		normalized === "localhost"
		|| normalized.endsWith(".localhost")
		|| normalized === "127.0.0.1"
		|| normalized === "[::1]"
		|| normalized === "::1"
		|| normalized === "pages.dev"
		|| normalized.endsWith(".pages.dev")
		|| normalized === "herokuapp.com"
		|| normalized.endsWith(".herokuapp.com")
	);
};

/**
 * Checks whether telemetry is disabled via environment configuration, non-production host guards, or bot detection.
 *
 * @remarks
 * Outside unit test runs (`import.meta.env.MODE !== "test"`), suppresses telemetry during local
 * development (`import.meta.env.DEV`) and on loopback or preview deployment hostnames so
 * non-production traffic never pollutes GA4 or BigQuery.
 *
 * @returns `true` when analytics should be suppressed.
 */
const isAnalyticsDisabled = (): boolean => {
	if (import.meta.env.VITE_ANALYTICS_ENABLED === "false" || isBot()) {
		return true;
	}

	if (import.meta.env.MODE !== "test") {
		if (import.meta.env.DEV) {
			return true;
		}

		if (typeof window !== "undefined" && isNonProductionHost(window.location?.hostname)) {
			return true;
		}
	}

	return false;
};

/**
 * Synchronizes the active Platform Type user property across client `gtag` and server-relay state.
 *
 * @remarks
 * Updates the in-memory `currentPlatformType` used by {@link getUserProperties} for server-relayed
 * events and immediately pushes `user_properties.platform_type` to `window.gtag` when client
 * tracking is active.
 *
 * @param platform - Active Platform Type identifier (e.g., `"standard"`, `"solar"`, `"corvette"`).
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * syncAnalyticsPlatformProperty("corvette");
 * // updates cached platform_type and forwards to window.gtag when active
 * ```
 */
export const syncAnalyticsPlatformProperty = (platform: string): void => {
	const resolved = platform || "standard";
	currentPlatformType = resolved;

	if (
		!isAnalyticsDisabled()
		&& typeof window !== "undefined"
		&& typeof window.gtag === "function"
	) {
		window.gtag("set", "user_properties", {
			platform_type: resolved,
		});
	}
};

/**
 * Normalizes event parameters for GA4 dispatch while mapping `page` -> `page_path` and booleans -> `"true"` / `"false"`.
 *
 * @remarks
 * Client-side `gtag` serializes boolean custom parameters as strings (`"true"` / `"false"`), whereas
 * the GA4 Measurement Protocol JSON API converts JSON booleans into `int_value` (`1` / `0`) in BigQuery.
 * Normalizing booleans to strings prior to dispatch guarantees identical `string_value` columns
 * across both transports ([ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 *
 * @param params - Raw event parameter dictionary (excluding `action` and `nonInteraction`).
 *
 * @returns Normalized parameter dictionary with `page_path` and stringified boolean dimensions.
 */
const normalizeEventParams = (params: AnalyticsEventParams): AnalyticsEventParams => {
	const normalized: AnalyticsEventParams = {};

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;

		const targetKey = key === "page" ? "page_path" : key;

		if (typeof value === "boolean") {
			normalized[targetKey] = value ? "true" : "false";
		} else {
			normalized[targetKey] = value;
		}
	}

	return normalized;
};

/**
 * Detects if an ad blocker or tracking protection is active.
 *
 * @remarks
 * Uses a multi-probe strategy to identify both browser-level script blockers (uBlock Origin, Brave)
 * and network-level DNS filters (Pi-hole):
 * 1. **GTM Script Probe**: Injects `gtag/js` and verifies `window.google_tag_manager` is populated.
 * 2. **GA Collect Probe**: `fetch` HEAD request to `https://www.google-analytics.com/g/collect`.
 * 3. **Fail-Fast Settlement**: Resolves to `true` immediately when either probe fails.
 * 4. **Timeout Safeguard**: Resolves to `true` after 3s if network requests silently stall.
 *
 * @returns A promise resolving to `true` if blocking is detected.
 *
 * @see {@link getAdBlockerDetectionResult}
 * @see {@link ./tracking.test.ts Unit Tests}
 *
 * @category Utilities
 */
const detectAdBlocker = (): Promise<boolean> => {
	const probes = [
		`https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`,
		"https://www.google-analytics.com/g/collect",
	];

	// Fallback for SSR / non-DOM environments
	if (typeof document === "undefined" || !document.head) {
		return (async () => {
			try {
				await Promise.all(
					probes.map(async (url) => {
						const controller = new AbortController();
						const timeoutId = setTimeout(() => controller.abort(), 3000);

						try {
							await fetch(url, {
								cache: "no-cache",
								method: "HEAD",
								mode: "no-cors",
								signal: controller.signal,
							});
						} finally {
							clearTimeout(timeoutId);
						}
					}),
				);

				return false;
			} catch {
				return true;
			}
		})();
	}

	if (typeof window !== "undefined") {
		ensureGtagFunction();
	}

	return new Promise<boolean>((resolve) => {
		let settled = false;
		let fetchSettled = false;
		let failures = 0;
		let successes = 0;

		// 1. Script injection probe (GTM)
		const script = document.createElement("script");
		script.src = probes[0];
		script.async = true;

		let timeoutId: null | ReturnType<typeof setTimeout> = null;
		const controller = new AbortController();

		const finish = (blocked: boolean) => {
			if (settled) return;
			settled = true;

			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}

			if (!fetchSettled) {
				controller.abort();
			}

			if (blocked) {
				try {
					script.remove();
				} catch {
					/* noop */
				}
			}

			resolve(blocked);
		};

		// Failsafe timeout for DNS sinkholes (e.g. Pi-hole) or stalled networks
		timeoutId = setTimeout(() => {
			finish(true);
		}, 3000);

		script.onload = () => {
			// Verify it's not a dummy script injected by uBlock/Brave
			const gtmLoaded = Boolean(window.google_tag_manager);

			if (!gtmLoaded) {
				failures++;
				finish(true);

				return;
			}

			successes++;

			if (successes + failures === probes.length) finish(failures > 0);
		};

		script.onerror = () => {
			failures++;
			finish(true);
		};

		// 2. Fetch probe (GA Collect)
		const fetchProbe = async () => {
			try {
				await fetch(probes[1], {
					cache: "no-store",
					method: "HEAD",
					mode: "no-cors",
					signal: controller.signal,
				});

				fetchSettled = true;
				successes++;

				if (successes + failures === probes.length) finish(failures > 0);
			} catch {
				fetchSettled = true;
				failures++;
				finish(true);
			}
		};

		try {
			document.head.appendChild(script);
			void fetchProbe();
		} catch {
			finish(true);
		}
	});
};

/**
 * Gets the cached result of the ad blocker detection or triggers a new detection.
 *
 * @returns A promise resolving to `true` if blocking is detected.
 *
 * @see {@link detectAdBlocker}
 * @see {@link initializeAnalytics}
 *
 * @category Utilities
 */
const getAdBlockerDetectionResult = async (): Promise<boolean> => {
	if (adBlockerResult !== null) {
		return adBlockerResult;
	}

	if (!adBlockerDetectionPromise) {
		adBlockerDetectionPromise = detectAdBlocker().then((result) => {
			adBlockerResult = result;

			return result;
		});
	}

	return adBlockerDetectionPromise;
};

/**
 * Attempts to retrieve the Client ID from the Google Analytics cookie (`_ga`).
 *
 * @returns The extracted ID or `null`.
 *
 * @category Utilities
 */
const getGaClientIdFromCookie = (): null | string => {
	if (typeof document === "undefined" || typeof document.cookie !== "string") return null;

	const match = document.cookie.match(/(?:^|; )\s*_ga=GA1\.[0-9]+\.([^;]+)/);

	return match ? match[1] : null;
};

/**
 * Attempts to extract the active GA4 `session_id` and `session_number` from the `_ga_<container>` cookie.
 *
 * @returns Parsed `{ sessionId, sessionNumber }` when a valid `GS1` or `GS2` container cookie exists, otherwise `null`.
 */
const getGaSessionFromCookie = (): null | { sessionId: number; sessionNumber: number } => {
	if (typeof document === "undefined" || typeof document.cookie !== "string") return null;

	const containerSuffix = TRACKING_ID.replace(/^G-/, "");
	const cookieRegex = new RegExp(`(?:^|; )\\s*_ga_${containerSuffix}=([^;]+)`);
	const match = document.cookie.match(cookieRegex);

	if (!match?.[1]) return null;

	const rawValue = match[1];

	// GS1 format: GS1.1.<sessionId>.<sessionNumber>...
	const gs1Match = rawValue.match(/^GS1\.\d+\.(\d+)\.(\d+)/);

	if (gs1Match) {
		const sessionId = Number.parseInt(gs1Match[1], 10);
		const sessionNumber = Number.parseInt(gs1Match[2], 10);

		if (Number.isFinite(sessionId) && sessionId > 0) {
			return {
				sessionId,
				sessionNumber:
					Number.isFinite(sessionNumber) && sessionNumber > 0 ? sessionNumber : 1,
			};
		}
	}

	// GS2 format: GS2.1.s<sessionId>$o<sessionNumber>$...
	const gs2SessionMatch = rawValue.match(/(?:^|\.|[$])s(\d+)/);

	if (gs2SessionMatch) {
		const sessionId = Number.parseInt(gs2SessionMatch[1], 10);
		const gs2NumberMatch = rawValue.match(/[$]o(\d+)/);
		const sessionNumber = gs2NumberMatch ? Number.parseInt(gs2NumberMatch[1], 10) : 1;

		if (Number.isFinite(sessionId) && sessionId > 0) {
			return {
				sessionId,
				sessionNumber:
					Number.isFinite(sessionNumber) && sessionNumber > 0 ? sessionNumber : 1,
			};
		}
	}

	return null;
};

/**
 * Reads or advances the rolling 30-minute GA4 session state for server-relayed Measurement Protocol events.
 *
 * @returns Active `{ sessionId, sessionNumber }` for the current user session.
 */
const getOrUpdateSessionState = (): { sessionId: number; sessionNumber: number } => {
	const cookieSession = getGaSessionFromCookie();

	if (cookieSession) {
		return cookieSession;
	}

	const now = Date.now();
	let stored: null | StoredSessionState = memorySessionState;

	if (typeof window !== "undefined" && window.sessionStorage) {
		try {
			const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

			if (raw) {
				const parsed = JSON.parse(raw) as Partial<StoredSessionState>;

				if (
					typeof parsed.sessionId === "number"
					&& parsed.sessionId > 0
					&& typeof parsed.lastActivityMs === "number"
				) {
					stored = {
						lastActivityMs: parsed.lastActivityMs,
						sessionId: parsed.sessionId,
						sessionNumber:
							typeof parsed.sessionNumber === "number" && parsed.sessionNumber > 0 ?
								parsed.sessionNumber
							:	1,
					};
				}
			}
		} catch {
			// Ignore sessionStorage access or parse errors in restricted contexts
		}
	}

	const nextState: StoredSessionState =
		!stored || now - stored.lastActivityMs > SESSION_TIMEOUT_MS ?
			{
				lastActivityMs: now,
				sessionId: Math.max(1, Math.floor(now / 1000)),
				sessionNumber: (stored?.sessionNumber ?? 0) + 1,
			}
		:	{
				lastActivityMs: now,
				sessionId: stored.sessionId,
				sessionNumber: stored.sessionNumber,
			};

	memorySessionState = nextState;

	if (typeof window !== "undefined" && window.sessionStorage) {
		try {
			window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextState));
		} catch {
			// Ignore storage quota or sandbox errors
		}
	}

	return {
		sessionId: nextState.sessionId,
		sessionNumber: nextState.sessionNumber,
	};
};

/**
 * Consumes foreground engagement milliseconds accumulated since the previous interactive server-relayed event.
 *
 * @param isPassive - Whether the event is marked `nonInteraction: true`.
 *
 * @returns Positive integer `engagement_time_msec` (`1`..`1800000`) for interactive events, or `undefined` for passive (`nonInteraction: true`) events without draining accumulated foreground time.
 */
const consumeEngagementTimeMs = (isPassive: boolean): number | undefined => {
	if (isPassive) {
		return undefined;
	}

	const now = Date.now();
	const isVisible = typeof document === "undefined" || document.visibilityState !== "hidden";

	let delta = accumulatedEngagementMs;
	accumulatedEngagementMs = 0;

	if (isVisible) {
		if (lastEngagementCheckpointMs !== null) {
			delta += Math.max(0, now - lastEngagementCheckpointMs);
		}

		lastEngagementCheckpointMs = now;
	} else {
		lastEngagementCheckpointMs = null;
	}

	const rounded = Math.round(delta);

	return Math.min(SESSION_TIMEOUT_MS, Math.max(1, rounded));
};

/**
 * Initializes first-hidden-time and foreground engagement visibility tracking.
 *
 * @returns Side-effects only.
 */
const ensureVisibilityTracking = (): void => {
	if (typeof document === "undefined") {
		return;
	}

	const isPrerendering = Boolean(
		(document as Document & { prerendering?: boolean }).prerendering,
	);

	if (firstHiddenTime < 0) {
		firstHiddenTime = document.visibilityState === "hidden" && !isPrerendering ? 0 : Infinity;
	}

	if (lastEngagementCheckpointMs === null && document.visibilityState !== "hidden") {
		lastEngagementCheckpointMs = Date.now();
	}

	if (visibilityWatcherRegistered) {
		return;
	}

	visibilityWatcherRegistered = true;

	document.addEventListener(
		"visibilitychange",
		(event?: Event) => {
			const now = Date.now();

			if (document.visibilityState === "hidden") {
				if (!Number.isFinite(firstHiddenTime)) {
					firstHiddenTime =
						typeof event?.timeStamp === "number" ? event.timeStamp
						: (
							typeof performance !== "undefined"
							&& typeof performance.now === "function"
						) ?
							performance.now()
						:	0;
				}

				if (lastEngagementCheckpointMs !== null) {
					accumulatedEngagementMs += Math.max(0, now - lastEngagementCheckpointMs);
					lastEngagementCheckpointMs = null;
				}
			} else if (lastEngagementCheckpointMs === null) {
				lastEngagementCheckpointMs = now;
			}
		},
		{ capture: true, passive: true },
	);
};

if (typeof document !== "undefined") {
	ensureVisibilityTracking();
}

/**
 * Attaches a `window` `"appinstalled"` listener once per lifecycle to capture real-time PWA installations.
 *
 * @returns Side-effects only.
 */
const ensureAppInstalledListener = (): void => {
	if (appInstalledListenerRegistered || typeof window === "undefined") {
		return;
	}

	appInstalledListenerRegistered = true;

	window.addEventListener("appinstalled", () => {
		isInstalledState = true;

		if (isAnalyticsDisabled()) {
			return;
		}

		if (typeof window.gtag === "function") {
			window.gtag("set", "user_properties", {
				is_installed: "yes",
			});
		}

		sendEvent({
			action: "app_installed",
			category: "engagement",
			nonInteraction: false,
			platform: getActivePlatformType(),
		});
	});
};

/**
 * Checks whether a `TTFB` metric originated from a tab that was hidden before `responseStart` or at report time.
 *
 * @param metric - Reported `TTFB` Web Vitals metric.
 *
 * @returns `true` if `TTFB` should be suppressed as a background navigation.
 */
const isBackgroundTtfb = (metric: Metric): boolean => {
	if (typeof document !== "undefined" && document.visibilityState === "hidden") {
		return true;
	}

	if (metric.navigationType === "back-forward-cache") {
		return false;
	}

	const ttfbWithAttr = metric as TTFBMetricWithAttribution;
	const navEntry = ttfbWithAttr.attribution?.navigationEntry ?? metric.entries?.[0];
	const activationStart =
		navEntry && "activationStart" in navEntry && typeof navEntry.activationStart === "number" ?
			navEntry.activationStart
		:	0;
	const responseStart =
		navEntry && "responseStart" in navEntry && typeof navEntry.responseStart === "number" ?
			navEntry.responseStart
		:	metric.value;

	if (firstHiddenTime >= 0 && firstHiddenTime <= responseStart) {
		return true;
	}

	if (typeof performance !== "undefined" && typeof performance.getEntriesByType === "function") {
		const visibilityEntries = performance.getEntriesByType("visibility-state");
		const wasHiddenBeforeResponse = visibilityEntries.some(
			(entry) =>
				entry.name === "hidden"
				&& entry.startTime >= activationStart
				&& entry.startTime <= responseStart,
		);

		if (wasHiddenBeforeResponse) {
			return true;
		}
	}

	return false;
};

/**
 * Resolves and persists the unique session client ID.
 *
 * @remarks
 * Reads the `_ga` cookie if available, falls back to `localStorage`, or generates
 * a new `web_<timestamp>_<random>` identifier and attaches early page-hide and PWA
 * installation listeners.
 *
 * @returns The initialized client ID.
 *
 * @category Utilities
 */
const initializeAnalyticsClient = (): string => {
	ensureFlushOnHideListeners();
	ensureVisibilityTracking();
	ensureAppInstalledListener();

	const gaId = getGaClientIdFromCookie();
	const stored = safeGetItem("analytics_client_id");

	if (gaId) {
		clientId = gaId;

		if (stored !== gaId) {
			safeSetItem("analytics_client_id", gaId);
		}
	} else if (stored) {
		clientId = stored;
	} else {
		clientId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
		safeSetItem("analytics_client_id", clientId);
	}

	return clientId;
};

/**
 * Gets the current client ID, initializing it if necessary.
 *
 * @returns The active client ID.
 *
 * @category Utilities
 */
const getClientId = (): string => {
	if (!clientId) {
		initializeAnalyticsClient();
	}

	return clientId;
};

/**
 * Builds a standardized GA4 `exception` event payload without stack traces.
 *
 * @remarks
 * Formats `error.name` and `error.message` into a 150-character `description`
 * and omits stack traces in accordance with ADR-0002 and ADR-0003.
 *
 * @param error - The caught or handled error instance.
 * @param fatal - Whether the exception crashed a boundary (`true`) or was handled (`false`).
 * @param [fallbackName="Error"] - Default error name when `error.name` is empty.
 *
 * @returns The standardized `GA4Event` payload for an exception.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const event = buildExceptionEvent(new Error("Boom"), true);
 * // returns { action: "exception", category: "error", description: "Error: Boom", fatal: true, nonInteraction: true }
 * ```
 */
export const buildExceptionEvent = (
	error: Error,
	fatal: boolean,
	fallbackName = "Error",
): GA4Event => ({
	action: "exception",
	category: "error",
	description: `${error.name || fallbackName}: ${error.message}`.slice(0, 150),
	fatal,
	nonInteraction: true,
});

/**
 * Resolves default page context (`page_location`, `page_path`, `page_title`) from the active browser document.
 *
 * @returns Default page parameters so non-`page_view` server-relayed events never land in `(not set)` Page path.
 */
const getDefaultPageContext = (): AnalyticsEventParams => {
	const pathname = typeof window !== "undefined" ? (window.location?.pathname ?? "/") : "/";
	const search = typeof window !== "undefined" ? (window.location?.search ?? "") : "";
	const href =
		typeof window !== "undefined" ?
			window.location?.href
			|| (window.location?.hostname ?
				`https://${window.location.hostname}${pathname}${search}`
			:	undefined)
		:	undefined;
	const title = typeof document !== "undefined" ? document.title || undefined : undefined;

	return {
		...(href ? { page_location: href } : {}),
		page_path: `${pathname}${search}`,
		...(title ? { page_title: title } : {}),
	};
};

/**
 * Sends an analytics event to the backend `/api/events` endpoint for Measurement Protocol relay.
 *
 * @remarks
 * Enriches server-relayed events with `session_id`, `session_number`, `engagement_time_msec`,
 * default page context (`page_location`, `page_path`, `page_title`), and `userProperties`
 * (`app_version`, `is_installed`, `platform_type`) before transmitting over `navigator.sendBeacon`
 * or `fetch(..., { keepalive: true })`.
 *
 * @param event - Structured GA4 event to relay.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 */
const sendServerEvent = (event: GA4Event): void => {
	try {
		const { action, category, nonInteraction, ...params } = event;
		const normalizedParams = normalizeEventParams(params);
		const defaultPageContext = getDefaultPageContext();
		const { sessionId, sessionNumber } = getOrUpdateSessionState();
		const engagementTimeMs = consumeEngagementTimeMs(nonInteraction === true);
		const userProperties = getUserProperties();

		const payload: AnalyticsEventPayload = {
			clientId: getClientId(),
			eventName: action,
			params: {
				...defaultPageContext,
				...normalizedParams,
				app_version: userProperties.app_version,
				category,
				...(engagementTimeMs !== undefined ?
					{ engagement_time_msec: engagementTimeMs }
				:	{}),
				is_installed: userProperties.is_installed,
				...(typeof nonInteraction === "boolean" ?
					{ non_interaction: nonInteraction ? "true" : "false" }
				:	{}),
				session_id: sessionId,
				session_number: sessionNumber,
				tracking_source: "server",
			},
			userProperties,
		};

		const baseUrl =
			API_URL ?
				API_URL.endsWith("/") ?
					API_URL
				:	`${API_URL}/`
			:	"/";
		const endpoint = `${baseUrl}api/events`;

		if (navigator.sendBeacon) {
			try {
				payload.params = { ...payload.params, transport: "beacon" };
				const beaconBlob = new Blob([JSON.stringify(payload)], {
					type: "application/json",
				});
				const success = navigator.sendBeacon(endpoint, beaconBlob);
				if (success) return;
			} catch (error) {
				Logger.warn("navigator.sendBeacon failed, falling back to fetch:", {
					error,
				});
			}
		}

		payload.params = { ...payload.params, transport: "fetch-keepalive" };
		fetch(endpoint, {
			body: JSON.stringify(payload),
			headers: {
				"Content-Type": "application/json",
			},
			keepalive: true,
			method: "POST",
		}).catch((error) => {
			Logger.error("Analytics event fallback failed:", error);
		});
	} catch (error) {
		Logger.error("Error preparing analytics event:", error);
	}
};

/**
 * Attaches `visibilitychange` and `pagehide` listeners once per session so queued
 * pre-initialization events survive early tab close (including Safari/WebKit `pagehide`).
 *
 * @returns Side-effects only.
 */
const ensureFlushOnHideListeners = (): void => {
	if (
		hideListenersRegistered
		|| typeof window === "undefined"
		|| typeof document === "undefined"
	) {
		return;
	}

	hideListenersRegistered = true;

	const drainQueuedToServer = () => {
		if (isAnalyticsDisabled() || queuedEvents.length === 0) {
			return;
		}

		const eventsToFlush = queuedEvents;
		queuedEvents = [];
		eventsToFlush.forEach(sendServerEvent);
	};

	const flushOnVisibilityChange = () => {
		if (document.visibilityState !== "hidden") {
			return;
		}

		drainQueuedToServer();
	};

	document.addEventListener("visibilitychange", flushOnVisibilityChange);
	window.addEventListener("pagehide", drainQueuedToServer);
};

/**
 * Generates a concise CSS selector for an interacted or shifted DOM node while skipping
 * ephemeral `#radix-*` IDs and collapsing coordinate-indexed `#grid-cell-r-c` IDs into `#grid-cell`.
 *
 * @param node - The DOM node to generate a selector for.
 *
 * @returns A CSS selector string identifying the target element, or `""` when unavailable.
 */
const generateInteractionTarget = (node: Node | null): string => {
	let selector = "";
	let current: Node | null = node;

	try {
		while (current && current.nodeType !== DOCUMENT_NODE) {
			const el = current as Element;
			const name =
				el.nodeType === ELEMENT_NODE ?
					el.nodeName.toLowerCase()
				:	el.nodeName.toUpperCase().replace(/^#/, "");
			const rawId = el.id || "";
			const hasSemanticId = Boolean(rawId && !rawId.startsWith("radix-"));
			const normalizedId = GRID_CELL_ID_PATTERN.test(rawId) ? "grid-cell" : rawId;
			const part =
				hasSemanticId ?
					`#${normalizedId}`
				:	[name, ...Array.from(el.classList ?? []).sort()].join(".");

			if (selector.length + part.length > MAX_SELECTOR_LENGTH - 1) {
				return selector || part;
			}

			selector = selector ? `${part}>${selector}` : part;

			if (hasSemanticId) {
				break;
			}

			current = el.parentNode;
		}
	} catch {
		// Ignore detached or cross-origin DOM traversal errors
	}

	return selector;
};

/**
 * Normalizes a raw target string returned by `web-vitals` when a custom `generateTarget` callback was not used.
 *
 * @param rawTarget - Raw CSS selector or URL from Web Vitals attribution.
 *
 * @returns Selector with `#grid-cell-r-c` collapsed to `#grid-cell`.
 */
const normalizeTargetString = (rawTarget: string): string =>
	rawTarget.replace(/#grid-cell-\d+-\d+\b/g, "#grid-cell");

/**
 * Registers passive capture-phase `pointerdown` and `keydown` listeners to record the target
 * selector before synchronous dialog or menu teardown removes the node from the DOM.
 *
 * @returns Side-effects only.
 */
const ensureInteractionTargetCaptureListeners = (): void => {
	if (interactionCaptureListenersRegistered || typeof document === "undefined") {
		return;
	}

	interactionCaptureListenersRegistered = true;

	const captureTarget = (event: { target?: unknown }) => {
		const targetNode = (event?.target as Node | null) ?? null;

		if (targetNode && typeof targetNode.nodeName === "string") {
			const resolved = generateInteractionTarget(targetNode);

			if (resolved) {
				lastInteractedTargetSelector = resolved;
			}
		}
	};

	document.addEventListener("pointerdown", captureTarget, { capture: true, passive: true });
	document.addEventListener("keydown", captureTarget, { capture: true, passive: true });
};

/**
 * Formats and dispatches a Core Web Vitals metric through {@link sendEvent}.
 *
 * @remarks
 * Converts the metric value to rounded integer event parameters (`CLS * 1000` or milliseconds,
 * using `metric.value` for `INP` so subsequent lower-percentile updates never emit negative deltas)
 * while preserving both `value` (backing the GA4 `Performance Value` Custom Metric) and `metric_value`,
 * plus `label: metric.id` (`^v\d+-\d+-\d+$`) for BigQuery delta deduplication
 * ([ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 *
 * @param metric - The Web Vitals metric to send.
 *
 * @returns Side-effects only.
 */
const sendVitalsMetric = (metric: Metric): void => {
	if (metric.name === "TTFB" && isBackgroundTtfb(metric)) {
		return;
	}

	const rawValue =
		metric.name === "CLS" ? metric.delta * 1000
		: metric.name === "INP" ? (metric.value ?? metric.delta)
		: metric.delta;
	const roundedValue = Math.round(rawValue);

	const event: PerformanceMetricGA4Event = {
		action: "performance_metric",
		app_version: getAppVersion(),
		category: "performance",
		label: metric.id,
		metric_name: metric.name,
		metric_value: roundedValue,
		nonInteraction: true,
		value: roundedValue,
	};

	if (metric.name === "INP" && "attribution" in metric) {
		const inpMetric = metric as INPMetricWithAttribution;
		const attribution = inpMetric.attribution;

		if (attribution) {
			const rawTarget =
				attribution.interactionTarget
				|| lastInteractedTargetSelector
				|| "(unmounted element)";
			const target = normalizeTargetString(rawTarget);
			event.interaction_target = target;

			if (attribution.interactionType) {
				event.interaction_type = attribution.interactionType;
			}

			if (typeof attribution.inputDelay === "number") {
				event.input_delay = Math.round(attribution.inputDelay);
			}

			if (typeof attribution.processingDuration === "number") {
				event.processing_duration = Math.round(attribution.processingDuration);
			}

			if (typeof attribution.presentationDelay === "number") {
				event.presentation_delay = Math.round(attribution.presentationDelay);
			}

			if (attribution.loadState) {
				event.load_state = attribution.loadState;
			}

			Logger.info(`[Web Vitals INP] ${Math.round(metric.value)}ms (${metric.rating})`, {
				inputDelay: Math.round(attribution.inputDelay),
				loadState: attribution.loadState,
				presentationDelay: Math.round(attribution.presentationDelay),
				processingDuration: Math.round(attribution.processingDuration),
				target,
				type: attribution.interactionType,
			});
		}
	} else if (metric.name === "LCP" && "attribution" in metric) {
		const lcpMetric = metric as LCPMetricWithAttribution;
		const attribution = lcpMetric.attribution;

		if (attribution) {
			const target = attribution.target || attribution.url;

			if (target) {
				event.interaction_target = normalizeTargetString(target);
			}
		}
	} else if (metric.name === "CLS" && "attribution" in metric) {
		const clsMetric = metric as CLSMetricWithAttribution;
		const attribution = clsMetric.attribution;

		if (attribution) {
			if (attribution.largestShiftTarget) {
				event.interaction_target = normalizeTargetString(attribution.largestShiftTarget);
			}

			if (attribution.loadState) {
				event.load_state = attribution.loadState;
			}
		}
	}

	sendEvent(event);
};

/**
 * Lazily imports `web-vitals/attribution` and attaches `PerformanceObserver` listeners.
 *
 * @remarks
 * Triggered at the start of {@link initializeAnalytics} before awaiting the 3-second
 * ad-blocker probe so early `FCP`, `TTFB`, and `LCP` entries are observed immediately
 * and buffered until transport resolution completes.
 *
 * @returns Resolves once all five Core Web Vitals observers are registered.
 */
const registerWebVitals = async (): Promise<void> => {
	const vitalsModule = await import("web-vitals/attribution");

	if (typeof vitalsModule?.onCLS !== "function") {
		return;
	}

	const { onCLS, onFCP, onINP, onLCP, onTTFB } = vitalsModule;
	ensureInteractionTargetCaptureListeners();
	onCLS(sendVitalsMetric, { generateTarget: generateInteractionTarget });
	onINP(sendVitalsMetric, { generateTarget: generateInteractionTarget });
	onFCP(sendVitalsMetric);
	onLCP(sendVitalsMetric, { generateTarget: generateInteractionTarget });
	onTTFB(sendVitalsMetric);
};

/**
 * Initializes Google Analytics tracking and Core Web Vitals observers.
 *
 * @remarks
 * Resolves the session client ID, registers Core Web Vitals observers concurrently
 * with ad-blocker detection, configures `window.gtag` directly when unblocked, and drains
 * any pre-initialization events through the resolved transport.
 *
 * @returns Resolves when initialization is complete or skipped.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await initializeAnalytics();
 * // returns Promise<void>
 * ```
 */
export const initializeAnalytics = async (): Promise<void> => {
	if (gaInitialized || isAnalyticsDisabled()) {
		return;
	}

	const resolvedClientId = initializeAnalyticsClient();

	const vitalsPromise = registerWebVitals();
	const isBlocked = await getAdBlockerDetectionResult();

	if (!isBlocked && typeof window !== "undefined") {
		const gtag = ensureGtagFunction();
		const userProperties = getUserProperties();

		gtag("js", new Date());
		gtag("config", TRACKING_ID, {
			allow_ad_personalization_signals: false,
			allow_google_signals: false,
			client_id: resolvedClientId,
			send_page_view: false,
			user_properties: userProperties,
		});
		gtagConfigured = true;
	}

	// Drain any events queued before detection completed. When blocked, route
	// them through the server fallback instead of dropping them on the floor.
	if (queuedEvents.length > 0) {
		const eventsToFlush = queuedEvents;
		queuedEvents = [];
		eventsToFlush.forEach(sendEvent);
	}

	await vitalsPromise;
	gaInitialized = true;
};

/**
 * Validates that an event has required properties.
 *
 * @param event - Event to validate.
 *
 * @throws {Error} If action or category is missing.
 *
 * @category Utilities
 */
const validateEvent = (event: GA4Event): void => {
	if (!event.action) {
		throw new Error("Event must have an 'action' property");
	}

	if (!event.category) {
		throw new Error("Event must have a 'category' property");
	}
};

/**
 * Sends an event to Google Analytics, automatically choosing the resolved transport method.
 *
 * @param event - Event to send.
 * @param isBlocked - Whether client-side tracking is blocked.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 */
const dispatchEvent = (event: GA4Event, isBlocked: boolean): void => {
	if (isBlocked) {
		sendServerEvent(event);

		return;
	}

	if (!gtagConfigured || typeof window === "undefined" || typeof window.gtag !== "function") {
		ensureFlushOnHideListeners();
		queuedEvents.push(event);

		return;
	}

	const { action, category, nonInteraction, ...params } = event;
	const normalizedParams = normalizeEventParams(params);
	window.gtag("event", action, {
		...normalizedParams,
		app_version: getAppVersion(),
		category,
		is_installed: getIsInstalled() ? "yes" : "no",
		...(typeof nonInteraction === "boolean" ? { non_interaction: nonInteraction } : {}),
		tracking_source: "client",
		transport: "gtag",
	});
};

/**
 * Dispatches a validated GA4 event to the resolved client `gtag` or `/api/events` server relay.
 *
 * @remarks
 * Provides a synchronous dispatch path required for late-firing lifecycle events (such as Core Web
 * Vitals on `visibilitychange`), suppressing telemetry when disabled or in bot environments before
 * validating and routing via {@link dispatchEvent}.
 *
 * @param event - The structured event payload to transmit.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * sendEvent({ action: "page_view", category: "engagement", page_title: "Home" });
 * // returns void
 * ```
 */
export const sendEvent = (event: GA4Event): void => {
	if (isAnalyticsDisabled()) {
		return;
	}

	try {
		validateEvent(event);
	} catch (validationError) {
		Logger.error("Event validation failed:", validationError);

		return;
	}

	dispatchEvent(event, adBlockerResult ?? false);
};

/**
 * Defers a GA4 event via `requestIdleCallback` so UI click/tap handlers do not block INP.
 *
 * @remarks
 * Wraps {@link sendEvent} in `requestIdleCallback` (with a `setTimeout` fallback) for interactive
 * UI click/tap handlers. Do not use for unload or `visibilitychange` events—those must call
 * {@link sendEvent} synchronously.
 *
 * @param event - The structured event payload to transmit.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * onClick={() => sendDeferredEvent({ action: "buy_me_a_coffee_click", category: "ui" })}
 * // returns void
 * ```
 */
export const sendDeferredEvent = (event: GA4Event): void => {
	if (isAnalyticsDisabled()) {
		return;
	}

	const dispatch = () => sendEvent(event);

	if (typeof window !== "undefined" && "requestIdleCallback" in window) {
		window.requestIdleCallback(dispatch, { timeout: 1000 });
	} else {
		setTimeout(dispatch, 0);
	}
};

/**
 * Resets analytics initialization, session, and listener state for isolated unit tests.
 *
 * @remarks
 * Clears cached ad-blocker detection promises, queued events, session client ID, foreground
 * engagement accumulators, and DOM listener registration flags between test cases.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * resetAnalyticsForTesting();
 * // returns void
 * ```
 */
export const resetAnalyticsForTesting = (): void => {
	gaInitialized = false;
	gtagConfigured = false;
	hideListenersRegistered = false;
	appInstalledListenerRegistered = false;
	interactionCaptureListenersRegistered = false;
	visibilityWatcherRegistered = false;
	firstHiddenTime = -1;
	lastEngagementCheckpointMs = null;
	accumulatedEngagementMs = 0;
	memorySessionState = null;
	lastInteractedTargetSelector = "";
	adBlockerDetectionPromise = null;
	adBlockerResult = null;
	clientId = "";
	currentPlatformType = null;
	isInstalledState = null;
	queuedEvents = [];
};
