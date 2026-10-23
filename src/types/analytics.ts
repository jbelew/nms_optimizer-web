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
 * Telemetry event emitted when a user applies a Recommended Build.
 *
 * @category Types
 */
export interface ApplyBuildGA4Event {
	/** Event action identifier. */
	action: "apply_build";
	/** Recommended Build title. */
	build: string;
	/** Event category. */
	category: "build";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted when a user clicks the Buy Me a Coffee button.
 *
 * @category Types
 */
export interface BuyMeACoffeeClickGA4Event {
	/** Event action identifier. */
	action: "buy_me_a_coffee_click";
	/** Event category. */
	category: "ui";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted when a user triggers the header Easter egg.
 *
 * @category Types
 */
export interface EarnVirtualCurrencyGA4Event {
	/** Event action identifier. */
	action: "earn_virtual_currency";
	/** Event category. */
	category: "ui";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Numeric event value. */
	value?: number;
	/** Virtual currency name (`"easter_egg"`). */
	virtual_currency_name: string;
}

/**
 * Standard GA4 `exception` event emitted by error boundaries and error dialogs without stack traces.
 *
 * @category Types
 */
export interface ExceptionGA4Event {
	/** Event action identifier. */
	action: "exception";
	/** Event category. */
	category: "error";
	/** Diagnostic description truncated to 150 characters. */
	description: string;
	/** Whether the exception represents a fatal crash (`true`) or handled error (`false`). */
	fatal: boolean;
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
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
 * Telemetry event emitted when a Build File or Shared Grid URL is loaded.
 *
 * @category Types
 */
export interface LoadBuildGA4Event {
	/** Event action identifier. */
	action: "load_build";
	/** Event category. */
	category: "engagement" | "ui";
	/** Filename involved in a `.nms` Build File import. */
	file_name?: string;
	/** Import method (`"nms_file"` or `"shared_url"`). */
	method: "nms_file" | "shared_url";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted when an optimization solve triggers a Pattern No Fit warning.
 *
 * @category Types
 */
export interface NoFitWarningGA4Event {
	/** Event action identifier. */
	action: "no_fit_warning";
	/** Event category. */
	category: "ui";
	/** Number of checked modules included in the attempted solve. */
	module_count: number;
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Technology Category identifier. */
	tech: string;
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted when the 404 NotFound fallback route mounts.
 *
 * @category Types
 */
export interface NotFoundGA4Event {
	/** Event action identifier. */
	action: "not_found";
	/** Event category. */
	category: "navigation";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
}

/**
 * Telemetry event emitted upon completion of a Technology Category optimization solve.
 *
 * @category Types
 */
export interface OptimizeTechGA4Event {
	/** Event action identifier. */
	action: "optimize_tech";
	/** Count of Technology Categories currently placed on the workspace grid. */
	active_tech_count?: number;
	/** Solve Quality tier (`"boosted"`, `"standard"`, or `"insufficient_space"`). */
	bonus_status?: "boosted" | "insufficient_space" | "standard";
	/** Event category. */
	category: "engagement" | "ui";
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
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
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
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted for canonical route navigations, error screens, and virtual modal views.
 *
 * @category Types
 */
export interface PageViewGA4Event extends AcquisitionParams {
	/** Event action identifier. */
	action: "page_view";
	/** Event category. */
	category: "engagement" | "navigation";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Page identifier path, query string, and optional virtual hash. */
	page?: string;
	/** Full page location URL. */
	page_location?: string;
	/** Referrer URL. */
	page_referrer?: string;
	/** Resolved SEO or modal document title. */
	page_title?: string;
}

/**
 * Core Web Vitals performance telemetry event with DOM attribution and delta deduplication ID.
 *
 * @category Types
 */
export interface PerformanceMetricGA4Event {
	/** Event action identifier. */
	action: "performance_metric";
	/** Application version. */
	app_version?: string;
	/** Event category. */
	category: "performance";
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
	/** Whether the event is non-interactive. */
	nonInteraction: boolean;
	/** Presentation delay duration in milliseconds for INP attribution. */
	presentation_delay?: number;
	/** Processing duration in milliseconds for INP attribution. */
	processing_duration?: number;
	/** Rounded numeric metric value (`CLS * 1000` or milliseconds). */
	value: number;
}

/**
 * Telemetry event emitted when the user triggers a Session Reset.
 *
 * @category Types
 */
export interface ResetGridGA4Event {
	/** Event action identifier. */
	action: "reset_grid";
	/** Event category. */
	category: "ui";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted when a user exports a `.nms` Build File.
 *
 * @category Types
 */
export interface SaveBuildGA4Event {
	/** Event action identifier. */
	action: "save_build";
	/** Name of the saved Build File. */
	build_name: string;
	/** Event category. */
	category: "ui";
	/** Export method (`"nms_file"`). */
	method: "nms_file";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted when a user exports a PNG screenshot of the grid.
 *
 * @category Types
 */
export interface ScreenshotBuildGA4Event {
	/** Event action identifier. */
	action: "screenshot_build";
	/** Event category. */
	category: "ui";
	/** Export method (`"png"`). */
	method: "png";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted when a user selects a Platform Type or application language.
 *
 * @category Types
 */
export interface SelectContentGA4Event {
	/** Event action identifier. */
	action: "select_content";
	/** Event category. */
	category: "ui";
	/** Type of content selected (`"platform"` or `"language"`). */
	content_type: "language" | "platform";
	/** Selected platform key or ISO language code. */
	item_id: string;
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted when a user generates a shareable URL for a layout.
 *
 * @category Types
 */
export interface ShareGA4Event {
	/** Event action identifier. */
	action: "share";
	/** Event category. */
	category: "ui";
	/** Share method (`"url"`). */
	method: "url";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Numeric event value. */
	value?: number;
}

/**
 * Telemetry event emitted on the 3rd violation of a Slot Restriction in a session.
 *
 * @category Types
 */
export interface SlotRestrictionWarningGA4Event {
	/** Event action identifier. */
	action: "slot_restriction_warning";
	/** Event category. */
	category: "ui";
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Canonical Platform Type identifier. */
	platform: string;
	/** Slot Restriction violation reason (`"gridFixed"`, `"moduleLocked"`, `"rowLimit"`, `"superchargedFixed"`, `"superchargedLimit"`). */
	reason: string;
	/** Numeric event value. */
	value?: number;
}
