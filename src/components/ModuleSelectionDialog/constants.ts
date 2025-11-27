/**
 * Constants for module selection and organization.
 */

/**
 * The canonical order of module groups displayed in dialogs and UI.
 * This order is used consistently across module selection interfaces.
 */
export const MODULE_GROUP_ORDER = [
	"core",
	"figurines",
	"bonus",
	"upgrade",
	"atlantid",
	"reactor",
	"cosmetic",
	"trails",
] as const;

/**
 * The ranking order for Sigma/Tau/Theta module dependencies.
 * Modules with higher ranks depend on modules with lower ranks.
 * Order: Sigma (highest) -> Tau (middle) -> Theta (lowest)
 */
export const MODULE_RANK_ORDER = ["Theta", "Tau", "Sigma"] as const;
