import { SHIP_NAME_PREFIXES, SHIP_NAME_SUFFIXES } from "../constants/shipNames";

/**
 * Generates a random build name based on the ship type.
 * Format: shiptype-prefix_suffix
 * Creates NMS-themed names like "freighter-starfire_eternity"
 *
 * @param {string} shipType - The type of ship (e.g., "freighter", "starship").
 * @returns {string} A build name combining ship type with NMS-themed prefix and suffix (lowercase).
 */
export const generateBuildNameWithType = (shipType: string): string => {
	const prefix = SHIP_NAME_PREFIXES[Math.floor(Math.random() * SHIP_NAME_PREFIXES.length)];
	const suffix = SHIP_NAME_SUFFIXES[Math.floor(Math.random() * SHIP_NAME_SUFFIXES.length)];
	const sanitize = (str: string) => str.toLowerCase().replace(/'/g, "").replace(/ /g, "_");
	return `${shipType.toLowerCase()}-${sanitize(prefix)}_${sanitize(suffix)}`;
};
