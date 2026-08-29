/**
 * Pure functions and constants for validating technology module selection hierarchies.
 *
 * @remarks
 * Enforces tier-based de-selection logic (Theta > Tau > Sigma) for procedural technology modules.
 * When a higher-tier module is deselected, its dependent lower-tier counterparts are automatically deselected.
 *
 * @see {@link ./techRules.test.ts Unit Tests}
 *
 * @module store/tech/techRules
 */

/**
 * Order of module ranks, from highest rank to lowest rank.
 * Deselecting a higher rank cascades to all lower ranks in the same module category.
 *
 * @category Rules
 *
 * @type {readonly ["Theta", "Tau", "Sigma"]}
 */
export const MODULE_RANK_ORDER = ["Theta", "Tau", "Sigma"] as const;

/**
 * Groups/types of modules that are subject to rank order hierarchy validation.
 *
 * @category Rules
 *
 * @type {readonly ["atlantid", "cosmetic", "reactor", "upgrade"]}
 */
export const VALIDATION_GROUPS = ["atlantid", "cosmetic", "reactor", "upgrade"] as const;

/**
 * Validates and adjusts a new set of checked module IDs based on cascading de-selection rules.
 *
 * @remarks
 * Enforces the rule that removing a higher-tier module (e.g., 'Theta') automatically
 * deselects lower-tier modules (e.g., 'Tau', 'Sigma') in the same module group.
 *
 * @param {string[]} prevChecked - The previously checked module IDs.
 * @param {string[]} newChecked - The proposed new list of checked module IDs.
 * @param {Array<{ id: string; label: string; type?: string }>} modules - All available modules for the technology category.
 *
 * @returns {string[]} The validated and adjusted list of checked module IDs.
 *
 * @see {@link MODULE_RANK_ORDER}
 * @see {@link VALIDATION_GROUPS}
 * @see {@link ./techRules.test.ts Unit Tests}
 *
 * @category Rules
 *
 * @example Validating deselection of a Theta module
 * ```ts
 * const prev = ["theta_id", "tau_id", "sigma_id"];
 * const proposed = ["tau_id", "sigma_id"]; // Theta removed
 * const modules = [
 *   { id: "theta_id", label: "Upgrade Module Theta", type: "upgrade" },
 *   { id: "tau_id", label: "Upgrade Module Tau", type: "upgrade" },
 *   { id: "sigma_id", label: "Upgrade Module Sigma", type: "upgrade" }
 * ];
 * const result = validateModuleSelections(prev, proposed, modules);
 * // returns [] because removing Theta cascades to remove Tau and Sigma
 * ```
 */
export function validateModuleSelections(
	prevChecked: string[],
	newChecked: string[],
	modules: { id: string; label: string; type?: string }[]
): string[] {
	const newSet = new Set(newChecked);

	// Identify which modules were removed
	const removedIds = prevChecked.filter((id) => !newSet.has(id));

	// If no modules were removed, we don't need to perform cascading de-selection.
	if (removedIds.length === 0) {
		return newChecked;
	}

	const finalChecked = new Set(newChecked);

	for (const removedId of removedIds) {
		const module = modules.find((m) => m.id === removedId);
		if (!module) continue;

		const groupName = module.type || "upgrade";

		if (!VALIDATION_GROUPS.includes(groupName as (typeof VALIDATION_GROUPS)[number])) {
			continue;
		}

		const label = module.label || "";

		if (label.includes("Theta")) {
			// Find and remove Tau and Sigma modules in the same group
			const tauModules = modules.filter(
				(m) => (m.type || "upgrade") === groupName && m.label?.includes("Tau")
			);
			const sigmaModules = modules.filter(
				(m) => (m.type || "upgrade") === groupName && m.label?.includes("Sigma")
			);

			for (const m of tauModules) {
				finalChecked.delete(m.id);
			}

			for (const m of sigmaModules) {
				finalChecked.delete(m.id);
			}
		} else if (label.includes("Tau")) {
			// Find and remove Sigma modules in the same group
			const sigmaModules = modules.filter(
				(m) => (m.type || "upgrade") === groupName && m.label?.includes("Sigma")
			);

			for (const m of sigmaModules) {
				finalChecked.delete(m.id);
			}
		}
	}

	return Array.from(finalChecked);
}
