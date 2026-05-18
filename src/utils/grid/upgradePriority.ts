/**
 * Determines the upgrade priority identifier based on a technology's label.
 *
 * @remarks
 * This utility parses technology labels for specific NMS tier identifiers (Theta, Tau, Sigma)
 * and prefixes them with a type code (S for Salvaged, F for Forbidden, R for Reactor, C for Booster).
 *
 * @param {string | undefined} label - The display label of the technology.
 *
 * @returns {string} A short priority code (e.g., "S1", "F2", "C1") or an empty string.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * getUpgradePriority("Salvaged Theta Module"); // returns "S1"
 * getUpgradePriority("Forbidden Tau Reactor"); // returns "F2"
 * ```
 *
 * @performance Pure function, O(n) where n is label length.
 *
 */
export const getUpgradePriority = (label: string | undefined): string => {
	if (!label) return "";

	const lowerLabel = label.toLowerCase();

	let tier = "";
	if (lowerLabel.includes("theta")) tier = "1";
	else if (lowerLabel.includes("tau")) tier = "2";
	else if (lowerLabel.includes("sigma")) tier = "3";

	if (!tier) return "";

	if (lowerLabel.includes("salvaged")) return `S${tier}`;
	if (lowerLabel.includes("forbidden")) return `F${tier}`;
	if (lowerLabel.includes("reactor")) return `R${tier}`;

	const isBooster =
		lowerLabel.includes("booster") ||
		lowerLabel.includes("habitation") ||
		lowerLabel.includes("array") ||
		lowerLabel.includes("arcadia") ||
		lowerLabel.includes("ion barrier") ||
		lowerLabel.includes("deflector shield") ||
		lowerLabel.includes("mag-field") ||
		lowerLabel.includes("thunderbird") ||
		lowerLabel.includes("torpedo") ||
		lowerLabel.includes("landing") ||
		lowerLabel.includes("platform") ||
		lowerLabel.includes("defense cannon") ||
		lowerLabel.includes("deadeye");

	if (isBooster) return `C${tier}`;
	if (lowerLabel.includes("upgrade")) return tier;

	return "";
};
