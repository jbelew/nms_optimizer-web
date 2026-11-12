/**
 * Analytics and tracking types for NMS Optimizer.
 *
 * @remarks
 * Defines the strongly-typed discriminated union {@link GA4Event} aligned with
 * [`GLOSSARY.md`](../../GLOSSARY.md) and the cross-repo GA4/BigQuery telemetry contract
 * ([ADR-0003](../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 *
 * @category Types
 */

/**
 * Inbound campaign and referral query parameters extracted from the landing URL.
 *
 * @category Types
 */
export interface AcquisitionParams {
	/** Lightweight referral source parameter (`?ref=`) extracted from the landing URL. */
	ref?: string;
	/** Inbound campaign name (`?utm_campaign=`) extracted from the landing URL. */
	utm_campaign?: string;
	/** Inbound campaign content identifier (`?utm_content=`) extracted from the landing URL. */
	utm_content?: string;
	/** Inbound marketing medium (`?utm_medium=`) extracted from the landing URL. */
	utm_medium?: string;
	/** Inbound acquisition source (`?utm_source=`) extracted from the landing URL. */
	utm_source?: string;
	/** Inbound paid/organic search term (`?utm_term=`) extracted from the landing URL. */
	utm_term?: string;
}

/**
 * Key-value pairs for generic analytics parameters.
 *
 * @category Types
 */
export interface AnalyticsEventParams {
	[key: string]: boolean | number | string | undefined;
}

/**
 * Discriminated union of all Google Analytics 4 telemetry events emitted by `nms_optimizer-web`.
 *
 * @remarks
 * Keyed by `action` to enforce compile-time schema invariants across all callers while
 * serializing boolean parameters into `"true"` / `"false"` strings at dispatch time
 * per [ADR-0003](../../docs/adr/0003-ga4-bigquery-telemetry-contract.md).
 *
 * @see {@link AcquisitionParams}
 * @see {@link AnalyticsEventParams}
 *
 * @category Types
 */
export type GA4Event =
	| AppInstalledGA4Event
	| ApplyBuildGA4Event
	| BuyMeACoffeeClickGA4Event
	| EarnVirtualCurrencyGA4Event
	| ExceptionGA4Event
	| LoadBuildGA4Event
	| NoFitWarningGA4Event
	| NotFoundGA4Event
	| OptimizeTechGA4Event
	| PageViewGA4Event
	| PerformanceMetricGA4Event
	| ResetGridGA4Event
	| SaveBuildGA4Event
	| ScreenshotBuildGA4Event
	| SelectContentGA4Event
	| ShareGA4Event
	| SlotRestrictionWarningGA4Event;

/**
 * Telemetry event emitted for canonical route navigations, Routed Dialogs, virtual modal screens, and error screens (`404`/`500`).
 *
 * @category Types
 */
export interface PageViewGA4Event extends AcquisitionParams, BaseGA4Event {
	/** Event action identifier. */
	action: "page_view";
	/** Page identifier path and query/hash string mapped to `page_path` on dispatch. */
	page?: string;
	/** Full page location URL. */
	page_location?: string;
	/** Referrer URL. */
	page_referrer?: string;
	/** Resolved SEO, modal, or error screen document title. */
	page_title?: string;
}

/**
 * Core Web Vitals performance telemetry event with DOM attribution and delta deduplication ID.
 *
 * @category Types
 */
export interface PerformanceMetricGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "performance_metric";
	/** Application version. */
	app_version?: string;
	/** Input delay duration in milliseconds for INP attribution. */
	input_delay?: number;
	/** Target DOM element selector for Web Vitals attribution (`INP`, `LCP`, `CLS`). */
	interaction_target?: string;
	/** Interaction type for INP attribution (e.g., `"pointer"`, `"keyboard"`). */
	interaction_type?: string;
	/** Unique `web-vitals` metric ID (`^v\d+-\d+-\d+$`) used for BigQuery delta deduplication. */
	label: string;
	/** Document load state during a Web Vitals measurement. */
	load_state?: string;
	/** Metric name for Web Vitals (`"LCP"`, `"CLS"`, `"INP"`, `"FCP"`, `"TTFB"`). */
	metric_name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
	/** Rounded numeric metric value (`CLS * 1000` or milliseconds) mirrored alongside `value`. */
	metric_value?: number;
	/** Presentation delay duration in milliseconds for INP attribution. */
	presentation_delay?: number;
	/** Processing duration in milliseconds for INP attribution. */
	processing_duration?: number;
	/** Rounded numeric metric value backing the GA4 `Performance Value` Custom Metric. */
	value: number;
}

/**
 * Canonical high-level GA4 event categories emitted across the application.
 */
type AnalyticsEventCategory =
	"build" | "engagement" | "error" | "navigation" | "performance" | "ui";

/**
 * Telemetry event emitted when the browser reports a completed PWA installation (`appinstalled`).
 */
interface AppInstalledGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "app_installed";
	/** Canonical Platform Type identifier active during installation. */
	platform: string;
}

/**
 * Telemetry event emitted when a user applies a Recommended Build.
 */
interface ApplyBuildGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "apply_build";
	/** Recommended Build title. */
	build: string;
	/** Canonical Platform Type identifier. */
	platform: string;
}

/**
 * Shared envelope fields carried across all application GA4 telemetry events.
 */
interface BaseGA4Event {
	/** High-level event category (`"build"`, `"engagement"`, `"error"`, `"navigation"`, `"performance"`, or `"ui"`). */
	category: AnalyticsEventCategory;
	/** Whether the event is passive (`true`) or represents direct user interaction (`false`). */
	nonInteraction?: boolean;
}

/**
 * Telemetry event emitted when a user clicks the Buy Me a Coffee button.
 */
interface BuyMeACoffeeClickGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "buy_me_a_coffee_click";
}

/**
 * Telemetry event emitted when a user discovers the NMS logo Easter egg coordinates popover.
 */
interface EarnVirtualCurrencyGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "earn_virtual_currency";
	/** Numeric virtual currency quantity (`1`). */
	value: number;
	/** Virtual currency identifier (`"easter_egg"`). */
	virtual_currency_name: string;
}

/**
 * Standard GA4 `exception` event emitted by error boundaries and error dialogs without stack traces.
 */
interface ExceptionGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "exception";
	/** Diagnostic description truncated to 150 characters. */
	description: string;
	/** Whether the exception represents a fatal crash (`true`) or handled error (`false`). */
	fatal: boolean;
}

/**
 * Telemetry event emitted when a Build File or Shared Grid URL is loaded.
 */
interface LoadBuildGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "load_build";
	/** Filename involved in a `.nms` Build File import. */
	file_name?: string;
	/** Import method (`"nms_file"` or `"shared_url"`). */
	method: "nms_file" | "shared_url";
	/** Canonical Platform Type identifier. */
	platform: string;
}

/**
 * Telemetry event emitted when an optimization solve triggers a Pattern No Fit or Supercharged No Fit warning.
 */
interface NoFitWarningGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "no_fit_warning";
	/** Number of checked modules included in the attempted solve. */
	module_count: number;
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Specific placement constraint warning reason (`"pattern_no_fit"` or `"supercharged_no_fit"`). */
	reason: "pattern_no_fit" | "supercharged_no_fit";
	/** Technology Category identifier (including `"photonix"` when Photonix Core Override is active). */
	tech: string;
}

/**
 * Telemetry event emitted when the 404 NotFound fallback route mounts.
 */
interface NotFoundGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "not_found";
}

/**
 * Telemetry event emitted upon completion of a Technology Category optimization solve.
 */
interface OptimizeTechGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "optimize_tech";
	/** Count of Technology Categories currently placed on the workspace grid. */
	active_tech_count?: number;
	/** Solve Quality tier (`"boosted"`, `"standard"`, or `"insufficient_space"`). */
	bonus_status?: "boosted" | "insufficient_space" | "standard";
	/** Whether the optimization was a Forced Solve after a Pattern No Fit warning. */
	forced?: boolean;
	/** Whether the workspace grid differs from the platform's Default Grid Layout. */
	is_custom_grid?: boolean;
	/** Whether the active Module Selection differs from the Technology Variant defaults. */
	is_custom_modules?: boolean;
	/** Rounded maximum bonus percentage achieved by the solve. */
	max_bonus?: number;
	/** Number of checked modules included in the solve. */
	module_count?: number;
	/** Canonical Platform Type identifier. */
	platform?: string;
	/** Optimization solve duration in milliseconds. */
	solve_duration_ms?: number;
	/** Optimization solver method returned by the backend. */
	solve_method?: string;
	/** Active Technology Variant identifier when a Technology Category has multiple variants. */
	solve_type?: string;
	/** Whether the solve achieved a boosted (`> 100%`) supercharged score. */
	supercharged?: boolean;
	/** Technology Category identifier (e.g., `"pulse"`, `"photonix"`, `"hyper"`). */
	tech?: string;
}

/**
 * Telemetry event emitted when the user triggers a Session Reset or manual Technology Reset.
 */
interface ResetGridGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "reset_grid";
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Scope of the reset action (`"session"` for full Session Reset or `"technology"` for single Technology Reset). */
	reset_scope: "session" | "technology";
	/** Technology Category identifier cleared during a manual Technology Reset (`reset_scope === "technology"`). */
	tech?: string;
}

/**
 * Telemetry event emitted when a user exports a `.nms` Build File.
 */
interface SaveBuildGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "save_build";
	/** Name of the saved Build File. */
	build_name: string;
	/** Export method (`"nms_file"`). */
	method: "nms_file";
	/** Canonical Platform Type identifier. */
	platform: string;
}

/**
 * Telemetry event emitted when a user exports a PNG screenshot of the grid.
 */
interface ScreenshotBuildGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "screenshot_build";
	/** Export method (`"png"`). */
	method: "png";
	/** Canonical Platform Type identifier. */
	platform?: string;
}

/**
 * Standard GA4 `select_content` telemetry event emitted when a user selects content, toggles preferences, or acts on prompts.
 */
interface SelectContentGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "select_content";
	/** Category of UI content selected, mapped natively to GA4's built-in `Content type` dimension. */
	content_type:
		| "app_update"
		| "error_recovery"
		| "focus_mode"
		| "language"
		| "optimization_alert"
		| "outbound_link"
		| "platform"
		| "share_link";
	/** Selected item or action identifier, mapped natively to GA4's built-in `Content ID` dimension. */
	item_id: string;
}

/**
 * Telemetry event emitted when a user generates a shareable URL for a layout.
 */
interface ShareGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "share";
	/** Share method (`"url"`). */
	method: "url";
	/** Canonical Platform Type identifier. */
	platform: string;
}

/**
 * Telemetry event emitted on the 3rd violation of a Slot Restriction in a session.
 */
interface SlotRestrictionWarningGA4Event extends BaseGA4Event {
	/** Event action identifier. */
	action: "slot_restriction_warning";
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Slot Restriction violation reason (`"gridFixed"`, `"moduleLocked"`, `"rowLimit"`, `"superchargedFixed"`, `"superchargedLimit"`). */
	reason: string;
}
