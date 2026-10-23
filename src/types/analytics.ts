/**
 * Analytics and tracking types for NMS Optimizer.
 *
 * @category Types
 */

/**
 * Key-value pairs for generic analytics parameters.
 *
 * @category Types
 */
export interface AnalyticsEventParams {
	[key: string]: boolean | number | string | undefined;
}

/**
 * Interface for Google Analytics 4 event tracking.
 *
 * @remarks
 * This interface supports both custom events and GA4 recommended events.
 * It uses canonical `snake_case` parameters aligned with [`GLOSSARY.md`](../../GLOSSARY.md)
 * and the cross-repo GA4/BigQuery telemetry contract ([ADR-0003](../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 *
 * @category Types
 */
export interface GA4Event {
	/** Event action/name (e.g., `'optimize_tech'`, `'select_content'`, `'share'`, `'exception'`). */
	action: string;
	/** Count of Technology Categories currently placed on the workspace grid. */
	active_tech_count?: number;
	/** Application version. Maps to `customEvent:app_version`. */
	app_version?: string;
	/** Solve Quality tier (`'boosted'`, `'standard'`, or `'insufficient_space'`). Maps to `customEvent:bonus_status`. */
	bonus_status?: "boosted" | "insufficient_space" | "standard";
	/** Recommended Build title for `apply_build` events. */
	build?: string;
	/** Name of the saved Build File for `save_build` events. */
	build_name?: string;
	/** Event category (e.g., `'ui'`, `'performance'`, `'error'`, `'engagement'`). */
	category: string;
	/** The type of content selected (e.g., `'platform'`, `'language'`). */
	content_type?: string;
	/** Diagnostic description for standard GA4 `exception` events. */
	description?: string;
	/** Whether an `exception` event represents a fatal crash. */
	fatal?: boolean | string;
	/** Filename involved in a Build File import (`load_build`). */
	file_name?: string;
	/** Screen name for `screen_view` events. */
	firebase_screen?: string;
	/** Whether the optimization was a Forced Solve after a Pattern No Fit warning. */
	forced?: boolean | string;
	/** Input delay duration in milliseconds for INP attribution. */
	input_delay?: number;
	/** Target DOM element selector for Web Vitals attribution (`INP`, `LCP`, `CLS`). Maps to `customEvent:interaction_target`. */
	interaction_target?: string;
	/** Interaction type for INP attribution (e.g., `'pointer'`, `'keyboard'`). Maps to `customEvent:interaction_type`. */
	interaction_type?: string;
	/** Whether the workspace grid differs from the platform's Default Grid Layout. */
	is_custom_grid?: boolean | string;
	/** Whether the active Module Selection differs from the Technology Variant defaults. */
	is_custom_modules?: boolean | string;
	/** Target identifier for a selected item (`select_content`). */
	item_id?: string;
	/** Optional event label or `web-vitals` metric ID (`^v\d+-\d+-\d+$`). */
	label?: string;
	/** Document load state during a Web Vitals measurement. Maps to `customEvent:load_state`. */
	load_state?: string;
	/** Rounded maximum bonus percentage achieved by an optimization solve. */
	max_bonus?: number;
	/** The method used for the action (e.g., `'nms_file'`, `'shared_url'`, `'url'`, `'png'`). Maps to `customEvent:method`. */
	method?: string;
	/** Unique metric ID from `web-vitals` for BigQuery delta deduplication. */
	metric_id?: string;
	/** Metric name for Web Vitals (`'LCP'`, `'CLS'`, `'INP'`, `'FCP'`, `'TTFB'`). Maps to `customEvent:metric_name`. */
	metric_name?: string;
	/** Web Vitals rating classification (`'good'`, `'needs-improvement'`, `'poor'`). */
	metric_rating?: string;
	/** Number of checked modules included in an optimization solve. */
	module_count?: number;
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;
	/** Page identifier path and query string. */
	page?: string;
	/** Full page location URL. */
	page_location?: string;
	/** Referrer URL. */
	page_referrer?: string;
	/** SEO document title. */
	page_title?: string;
	/** Canonical Platform Type identifier (e.g., `'standard'`, `'corvette'`). Maps to `customEvent:platform`. */
	platform?: string;
	/** Presentation delay duration in milliseconds for INP attribution. */
	presentation_delay?: number;
	/** Processing duration in milliseconds for INP attribution. */
	processing_duration?: number;
	/** Slot Restriction violation reason (`'gridFixed'`, `'moduleLocked'`, `'rowLimit'`, `'superchargedFixed'`, `'superchargedLimit'`). */
	reason?: string;
	/** Lightweight referral source parameter (`?ref=`) extracted from the landing URL. */
	ref?: string;
	/** Screen class for `screen_view` events. */
	screen_class?: string;
	/** Optimization solve duration in milliseconds. Maps to `customEvent:solve_duration_ms`. */
	solve_duration_ms?: number;
	/** Optimization solver method returned by the backend. Maps to `customEvent:solve_method`. */
	solve_method?: string;
	/** Active Technology Variant identifier when a Technology Category has multiple variants. */
	solve_type?: string;
	/** Whether the solve achieved a boosted (`> 100%`) supercharged score. Maps to `customEvent:supercharged`. */
	supercharged?: boolean | string;
	/** Technology Category identifier (e.g., `'pulse'`, `'photonix'`, `'hyper'`). Maps to `customEvent:tech`. */
	tech?: string;
	/** Page title. */
	title?: string;
	/** Tracking source (`'client'` or `'server'`). Maps to `customEvent:tracking_source`. */
	tracking_source?: string;
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
	/** Numeric event value. Maps to `customEvent:value`. */
	value?: number;
	/** Virtual currency name for `earn_virtual_currency` events. */
	virtual_currency_name?: string;
}
