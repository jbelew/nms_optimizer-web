/**
 * @file Internal constants used for organizing and managing module selection UI logic.
 */

/**
 * The canonical display order for module categories within the selection dialog.
 *
 * This order is strictly followed by the `DialogBody` when rendering module groups.
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
 * The hierarchical dependency order for procedural technology modules.
 *
 * In No Man's Sky, higher-tier modules often imply or require the existence
 * of lower-tier versions. This order (Theta -> Tau -> Sigma) is used by the
 * `useTechModuleManagement` hook to enforce selection rules.
 */
export const MODULE_RANK_ORDER = ["Theta", "Tau", "Sigma"] as const;
