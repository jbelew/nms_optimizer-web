/**
 * Utility module for generating No Man's Sky themed build names.
 *
 * @remarks
 * This module provides functions to create randomized, flavor-rich names
 * for ship builds, incorporating ship types and NMS-style prefixes/suffixes.
 *
 * @see {@link generateBuildNameWithType}
 *
 * @category Utilities
 */

import {
	SHIP_NAME_PREFIXES_COMPOUND,
	SHIP_NAME_PREFIXES_SIMPLE,
	SHIP_NAME_SUFFIXES,
} from "../../constants/shipNames";
import { sanitizeFilename } from "../validation/dataValidation";

/**
 * Mapping of internal ship type identifiers to user-friendly display names.
 *
 * @category Utilities
 */
const SHIP_TYPE_NAMES: Record<string, string> = {
	atlantid: "Atlantid",
	colossus: "Colossus",
	corvette: "Corvette",
	exosuit: "Exosuit",
	freighter: "Freighter",
	living: "Living",
	minotaur: "Minotaur",
	nautilon: "Nautilon",
	nomad: "Nomad",
	pilgrim: "Pilgrim",
	roamer: "Roamer",
	sentinel: "Sentinel",
	"sentinel-mt": "Sentinel MultiTool",
	solar: "Solar",
	standard: "Starship",
	"standard-mt": "MultiTool",
	staves: "Staff",
};

/**
 * Returns a user-friendly display name for a given ship type identifier.
 *
 * @remarks
 * Translates technical ship type keys (e.g., `'living'`) into their
 * readable equivalents (e.g., `'Living'`).
 *
 * @param {string} shipType - The internal ship type identifier. **Must not be null.**
 *
 * @returns {string} The localized display name, or the input `shipType` if no mapping exists.
 *
 * @see {@link SHIP_TYPE_NAMES}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const name = getShipTypeName("living"); // Returns "Living"
 * ```
 */
export const getShipTypeName = (shipType: string): string => {
	return SHIP_TYPE_NAMES[shipType.toLowerCase()] || shipType;
};

/**
 * Generates a random, NMS-themed build name prefixed with the ship type.
 *
 * @remarks
 * The generated name follows the pattern: `{ShipType} - {Prefix} {Suffix}`.
 * The output is automatically sanitized to be safe for use as a filename
 * using {@link sanitizeFilename}.
 *
 * @param {string} shipType - The ship type identifier used as a prefix.
 *
 * @returns {string} A sanitized, randomly generated build name.
 *
 * @see {@link getShipTypeName}
 * @see {@link sanitizeFilename}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const buildName = generateBuildNameWithType("freighter"); // e.g., "Freighter - Echo of the Void"
 * // returns string
 * ```
 */
export const generateBuildNameWithType = (shipType: string): string => {
	// Randomly choose between simple and compound prefix (50/50)
	const useCompound = Math.random() > 0.5;
	const prefixList = useCompound ? SHIP_NAME_PREFIXES_COMPOUND : SHIP_NAME_PREFIXES_SIMPLE;
	const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
	const suffix = SHIP_NAME_SUFFIXES[Math.floor(Math.random() * SHIP_NAME_SUFFIXES.length)];
	const friendlyShipType = getShipTypeName(shipType);

	return sanitizeFilename(`${friendlyShipType} - ${prefix} ${suffix}`);
};
