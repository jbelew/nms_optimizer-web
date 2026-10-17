/**
 * Pure domain rules for Technology Variant resolution, Module Group classification,
 * Module Selection state derivation, and Module Rank Order validation.
 *
 * @remarks
 * Consolidates all in-process business rules governing technology modules:
 * 1. **Module Rank Order** (`Theta` -> `Tau` -> `Sigma`): prerequisite lookup and cascading deselection.
 * 2. **Module Group** organization: grouping into canonical categories (`core`, `figurines`, `bonus`,
 *    `upgrade`, `atlantid`, `reactor`, `cosmetic`, `trails`) and alphabetical sorting.
 * 3. **Module Selection** helpers: computing "Select All" state and target module IDs.
 * 4. **Technology Variant** & localization resolution: selecting the active variant for a
 *    Technology Category and deriving its translation key.
 *
 * @see {@link ./techRules.test.ts Unit Tests}
 *
 * @module store/tech/techRules
 */

/**
 * Canonical display order for Module Groups within the Module Selection dialog.
 *
 * @category Rules
 *
 * @type {readonly ["core", "figurines", "bonus", "upgrade", "atlantid", "reactor", "cosmetic", "trails"]}
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
 * Hierarchical Module Rank Order from highest tier to lowest tier.
 * Deselecting a higher rank cascades to all lower ranks in the same Module Group,
 * and lower ranks require their immediate higher rank to be selected first.
 *
 * @category Rules
 *
 * @type {readonly ["Theta", "Tau", "Sigma"]}
 */
export const MODULE_RANK_ORDER = ["Theta", "Tau", "Sigma"] as const;

/**
 * Module Groups subject to Module Rank Order prerequisite and cascade validation.
 *
 * @category Rules
 *
 * @type {readonly ["atlantid", "cosmetic", "reactor", "upgrade"]}
 */
export const VALIDATION_GROUPS = ["atlantid", "cosmetic", "reactor", "upgrade"] as const;

/**
 * Module Groups whose entries are sorted alphabetically by display label.
 *
 * @category Rules
 *
 * @type {readonly ["bonus", "figurines", "trails"]}
 */
export const ALPHABETICAL_MODULE_GROUPS = ["bonus", "figurines", "trails"] as const;

/**
 * Determines whether all non-core modules in a Technology Variant are currently checked.
 *
 * @remarks
 * Core modules are always locked as checked, so "Select All" status is evaluated against
 * the selectable non-core modules.
 *
 * @param {Array<{ id: string; type?: string }>} modules - All available modules for the Technology Variant.
 * @param {string[]} checkedIds - Currently selected module IDs.
 *
 * @returns {boolean} `true` when every non-core module ID is present in `checkedIds`.
 *
 * @see {@link getSelectAllModuleIds}
 * @see {@link ./techRules.test.ts Unit Tests}
 *
 * @category Rules
 *
 * @example Checking whether all selectable modules are checked
 * ```ts
 * const allSelected = areAllModulesSelected(
 *   [{ id: "core1", type: "core" }, { id: "u1", type: "upgrade" }],
 *   ["core1", "u1"]
 * );
 * // returns true
 * ```
 */
export function areAllModulesSelected(
	modules: { id: string; type?: string }[],
	checkedIds: string[]
): boolean {
	return modules.filter((m) => m.type !== "core").every((m) => checkedIds.includes(m.id));
}

/**
 * Builds a prerequisite lookup map for ranked modules within a Module Group.
 *
 * @remarks
 * For rank-validated Module Groups (`atlantid`, `cosmetic`, `reactor`, `upgrade`), maps each
 * lower-rank module ID (e.g., `Tau`, `Sigma`) to the module ID of its immediate higher-rank
 * prerequisite (`Theta` for `Tau`, `Tau` for `Sigma`) according to {@link MODULE_RANK_ORDER}.
 *
 * @param {string} groupName - The Module Group identifier.
 * @param {Array<{ id: string; label?: string }>} modules - Modules belonging to the specified Module Group.
 *
 * @returns {Map<string, string>} Map from dependent module ID to prerequisite module ID.
 *
 * @see {@link MODULE_RANK_ORDER}
 * @see {@link VALIDATION_GROUPS}
 * @see {@link ./techRules.test.ts Unit Tests}
 *
 * @category Rules
 *
 * @example Computing prerequisite map for upgrade modules
 * ```ts
 * const map = getModulePrerequisites("upgrade", [
 *   { id: "u_theta", label: "Upgrade Theta" },
 *   { id: "u_tau", label: "Upgrade Tau" },
 * ]);
 * // returns Map { "u_tau" => "u_theta" }
 * ```
 */
export function getModulePrerequisites(
	groupName: string,
	modules: { id: string; label?: string }[]
): Map<string, string> {
	const dependencyMap = new Map<string, string>();

	if (!VALIDATION_GROUPS.includes(groupName as (typeof VALIDATION_GROUPS)[number])) {
		return dependencyMap;
	}

	const rankToModuleMap = new Map<string, string>();

	for (const module of modules) {
		if (module.label) {
			for (const rank of MODULE_RANK_ORDER) {
				if (module.label.includes(rank)) {
					rankToModuleMap.set(rank, module.id);
					break;
				}
			}
		}
	}

	for (const module of modules) {
		if (module.label) {
			const rankIndex = MODULE_RANK_ORDER.findIndex((rank) => module.label!.includes(rank));

			if (rankIndex > 0) {
				const prerequisiteRank = MODULE_RANK_ORDER[rankIndex - 1];
				const prerequisiteModuleId = rankToModuleMap.get(prerequisiteRank);

				if (prerequisiteModuleId) {
					dependencyMap.set(module.id, prerequisiteModuleId);
				}
			}
		}
	}

	return dependencyMap;
}

/**
 * Computes the next list of checked module IDs when the "Select All" toggle changes.
 *
 * @remarks
 * Selecting all includes every non-core module followed by every core module. Deselecting all
 * retains only the mandatory core modules.
 *
 * @param {Array<{ id: string; type?: string }>} modules - All available modules for the Technology Variant.
 * @param {"indeterminate" | boolean} checked - The target checked state from the "Select All" toggle.
 *
 * @returns {string[]} The resulting array of module IDs to persist in the Module Selection.
 *
 * @see {@link areAllModulesSelected}
 * @see {@link ./techRules.test.ts Unit Tests}
 *
 * @category Rules
 *
 * @example Resolving module IDs on Select All toggle
 * ```ts
 * const nextIds = getSelectAllModuleIds(
 *   [{ id: "core1", type: "core" }, { id: "u1", type: "upgrade" }],
 *   false
 * );
 * // returns ["core1"]
 * ```
 */
export function getSelectAllModuleIds(
	modules: { id: string; type?: string }[],
	checked: "indeterminate" | boolean
): string[] {
	const coreModuleIds = modules.filter((m) => m.type === "core").map((m) => m.id);

	if (!checked) {
		return coreModuleIds;
	}

	const nonCoreModuleIds = modules.filter((m) => m.type !== "core").map((m) => m.id);

	return [...nonCoreModuleIds, ...coreModuleIds];
}

/**
 * Derives the i18n lookup key suffix for a Technology Category from its icon path or key.
 *
 * @remarks
 * Strips the file extension and converts path separators (`/`) into dot notation (`.`)
 * so image paths like `"starship/pulse.webp"` map to `"starship.pulse"`. Falls back to
 * `tech` when `techImage` is null or empty.
 *
 * @param {string} tech - The Technology Category identifier.
 * @param {null | string} [techImage] - Optional relative icon path for the Technology Category.
 *
 * @returns {string} The dot-separated translation key segment under `technologies.*`.
 *
 * @see {@link ./techRules.test.ts Unit Tests}
 *
 * @category Rules
 *
 * @example Deriving translation key from image path
 * ```ts
 * const key = getTechnologyTranslationKey("pulse", "starship/pulse.webp");
 * // returns "starship.pulse"
 * ```
 */
export function getTechnologyTranslationKey(tech: string, techImage?: null | string): string {
	return techImage ? techImage.replace(/\.\w+$/, "").replace(/\//g, ".") : tech;
}

/**
 * Segregates a list of modules into canonical Module Groups and sorts alphabetical groups.
 *
 * @remarks
 * Modules whose label contains `"figurine"` (case-insensitive) are routed to the `figurines`
 * Module Group regardless of their `type` field. Modules with an unrecognized or missing `type`
 * default to `upgrade`. Entries within `bonus`, `figurines`, and `trails` are sorted alphabetically
 * by `label`.
 *
 * @template { { id: string; label?: string; type?: string } } T
 *
 * @param {T[]} modules - The available modules for the active Technology Variant.
 *
 * @returns {Record<string, T[]>} Dictionary of module arrays keyed by Module Group name.
 *
 * @see {@link MODULE_GROUP_ORDER}
 * @see {@link ALPHABETICAL_MODULE_GROUPS}
 * @see {@link ./techRules.test.ts Unit Tests}
 *
 * @category Rules
 *
 * @example Grouping and sorting technology modules
 * ```ts
 * const grouped = groupModules([
 *   { id: "b2", label: "Beta Bonus", type: "bonus" },
 *   { id: "b1", label: "Alpha Bonus", type: "bonus" },
 *   { id: "fig", label: "Polo Figurine", type: "bonus" },
 * ]);
 * // returns { bonus: [{ id: "b1", ... }, { id: "b2", ... }], figurines: [{ id: "fig", ... }], ... }
 * ```
 */
export function groupModules<T extends { id: string; label?: string; type?: string }>(
	modules: T[]
): Record<string, T[]> {
	const groups: Record<string, T[]> = {
		atlantid: [],
		bonus: [],
		core: [],
		cosmetic: [],
		figurines: [],
		reactor: [],
		trails: [],
		upgrade: [],
	};

	for (const module of modules) {
		if (module.label?.toLowerCase().includes("figurine")) {
			groups.figurines.push(module);
			continue;
		}

		const type = module.type || "upgrade";

		if (groups[type]) {
			groups[type].push(module);
		} else {
			groups.upgrade.push(module);
		}
	}

	for (const groupName of ALPHABETICAL_MODULE_GROUPS) {
		if (groups[groupName].length > 1) {
			groups[groupName].sort((a, b) => (a.label ?? "").localeCompare(b.label ?? ""));
		}
	}

	return groups;
}

/**
 * Resolves the active Technology Variant for a Technology Category from its available variants.
 *
 * @remarks
 * Matches the variant whose `type` equals `activeVariantType` (defaulting to `"normal"`),
 * falling back to the first variant in the list when no explicit match exists.
 *
 * @template { { type?: string } } T
 *
 * @param {T[] | undefined} variants - The list of Technology Variants for a Technology Category.
 * @param {string} [activeVariantType="normal"] - The active variant type identifier.
 *
 * @returns {T | undefined} The matching Technology Variant, or `undefined` if `variants` is empty.
 *
 * @see {@link ./techRules.test.ts Unit Tests}
 *
 * @category Rules
 *
 * @example Resolving the active variant
 * ```ts
 * const variant = resolveActiveTechVariant(
 *   [{ key: "pulse", type: "normal" }, { key: "pulse", type: "max" }],
 *   "max"
 * );
 * // returns { key: "pulse", type: "max" }
 * ```
 */
export function resolveActiveTechVariant<T extends { type?: string }>(
	variants: T[] | undefined,
	activeVariantType = "normal"
): T | undefined {
	if (!variants?.length) {
		return undefined;
	}

	return variants.length > 1
		? variants.find((v) => v.type === activeVariantType) || variants[0]
		: variants[0];
}

/**
 * Validates and adjusts a proposed Module Selection based on cascading Module Rank Order rules.
 *
 * @remarks
 * Enforces the rule that removing a higher-rank module (e.g., `Theta`) automatically
 * deselects all lower-rank modules (e.g., `Tau`, `Sigma`) in the same rank-validated Module Group.
 *
 * @param {string[]} prevChecked - The previously checked module IDs.
 * @param {string[]} newChecked - The proposed new list of checked module IDs.
 * @param {Array<{ id: string; label: string; type?: string }>} modules - All available modules for the Technology Variant.
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
 * // returns []
 * ```
 */
export function validateModuleSelections(
	prevChecked: string[],
	newChecked: string[],
	modules: { id: string; label: string; type?: string }[]
): string[] {
	const newSet = new Set(newChecked);
	const removedIds = prevChecked.filter((id) => !newSet.has(id));

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
		const removedRankIndex = MODULE_RANK_ORDER.findIndex((rank) => label.includes(rank));

		if (removedRankIndex === -1) {
			continue;
		}

		const lowerRanks = MODULE_RANK_ORDER.slice(removedRankIndex + 1);

		for (const lowerRank of lowerRanks) {
			for (const candidate of modules) {
				if (
					(candidate.type || "upgrade") === groupName &&
					candidate.label?.includes(lowerRank)
				) {
					finalChecked.delete(candidate.id);
				}
			}
		}
	}

	return Array.from(finalChecked);
}
