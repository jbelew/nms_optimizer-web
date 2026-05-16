/**
 * Analytics and tracking types for NMS Optimizer.
 *
 * @category Types
 */

/**
 * Key-value pairs for generic analytics parameters.
 */
export interface AnalyticsEventParams {
	[key: string]: boolean | number | string | undefined;
}

/**
 * Interface for Google Analytics 4 event tracking.
 *
 * @remarks
 * This interface is designed to support both custom events and GA4 recommended events.
 * It uses `snake_case` for all parameters to align with GA4 best practices.
 */
export interface GA4Event {
	/** Event action/name (e.g., 'optimize_tech', 'select_content', 'share'). */
	action: string;
	/** Application version. Maps to customEvent:app_version. */
	app_version?: string;
	/** Build ID. */
	build?: string;
	/** Name of the build (snake_case). */
	build_name?: string;
	/** Name of the build. */
	buildName?: string;

	/** Event category (e.g., 'ui', 'performance', 'error'). */
	category: string;
	/** React component stack trace. */
	componentStack?: string;
	// --- GA4 Recommended Parameters ---
	/** The type of content selected (e.g., 'platform', 'language'). */
	content_type?: string;
	/** Filename involved (snake_case). */
	file_name?: string;
	/** Filename involved. */
	fileName?: string;
	/** Screen name for screen_view events. */
	firebase_screen?: string;

	/** The identifier of the selected item. */
	item_id?: string;
	/** Optional event label (legacy/custom). */
	label?: string;
	/** The method used for the action (e.g., 'nms_file', 'url', 'png'). */
	method?: string;
	/** Metric name for web vitals. */
	metric_name?: string;
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;

	/** Page identifier. */
	page?: string;
	/** Page location URL. */
	page_location?: string;
	/** Referrer URL. */
	page_referrer?: string;
	/** SEO page title. */
	page_title?: string;
	// --- Custom Dimensions (Mapped in GA4) ---
	/** Platform identifier (e.g., 'starship', 'multitool'). Maps to customEvent:platform. */
	platform?: string;
	/** Screen class for screen_view events. */
	screen_class?: string;
	/** Ship type category. */
	shipType?: string;
	// --- Legacy/Other Parameters ---
	/** Method used for legacy solve tracking. */
	solve_method?: string;
	/** Error stack trace. */
	stackTrace?: string;
	/** Storage status. */
	storageCleared?: string;
	/** Whether the build is supercharged. Maps to customEvent:supercharged. */
	supercharged?: boolean;
	/** Tech identifier (e.g., 'pulse', 'hyperdrive'). Maps to customEvent:tech. */
	tech?: string;
	/** Page title. */
	title?: string;
	/** Tracking source (client/server). Maps to customEvent:tracking_source. */
	tracking_source?: string;
	/** Optional numeric value (legacy/custom). */
	value?: number;
	/** Virtual currency name for earn_virtual_currency events. */
	virtual_currency_name?: string;
}
