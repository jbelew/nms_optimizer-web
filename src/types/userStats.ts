/**
 * User statistics and usage monitoring types for NMS Optimizer.
 *
 * @category Types
 */

/**
 * Represents a single aggregate record of user optimization activity.
 */
export type UserStat = {
	/** The name of the analytics event. */
	event_name: string;
	/** The ship type identifier associated with the event. */
	ship_type: string;
	/** A string flag ('yes' or 'no') indicating if supercharged slots were used. */
	supercharged: string;
	/** The technology identifier that was optimized. */
	technology: string;
	/** The total occurrences of this specific configuration. */
	total_events: number;
};
