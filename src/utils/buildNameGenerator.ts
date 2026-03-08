import {
	SHIP_NAME_PREFIXES_COMPOUND,
	SHIP_NAME_PREFIXES_SIMPLE,
	SHIP_NAME_SUFFIXES,
} from "../constants/shipNames";
import { sanitizeFilename } from "./filenameValidation";

/**
 * Mapping of internal ship type identifiers to user-friendly display names.
 */
const SHIP_TYPE_NAMES: Record<string, string> = {
	standard: "Starship",
	sentinel: "Sentinel",
	solar: "Solar",
	living: "Living",
	"standard-mt": "MultiTool",
	atlantid: "Atlantid",
	"sentinel-mt": "Sentinel MultiTool",
	staves: "Staff",
	freighter: "Freighter",
	nomad: "Nomad",
	pilgrim: "Pilgrim",
	roamer: "Roamer",
	nautilon: "Nautilon",
	colossus: "Colossus",
	minotaur: "Minotaur",
	exosuit: "Exosuit",
	corvette: "Corvette",
};

/**
 * Returns a user-friendly display name for a given ship type identifier.
 *
 * @param {string} shipType - The internal ship type identifier (e.g., 'solar'). **Must not be null.**
 * @returns {string} The localized display name, or the input `shipType` if no mapping exists.
 *
 * @example
 * const name = getShipTypeName("living"); // Returns "Living"
 */
export const getShipTypeName = (shipType: string): string => {
	return SHIP_TYPE_NAMES[shipType.toLowerCase()] || shipType;
};

/**
 * Generates a random, NMS-themed build name prefixed with the ship type.
 *
 * The generated name follows the pattern: `{ShipType} - {Prefix} {Suffix}`.
 * The output is automatically sanitized to be safe for use as a filename.
 *
 * @param {string} shipType - The ship type identifier used as a prefix.
 * @returns {string} A sanitized, randomly generated build name.
 *
 * @example
 * const buildName = generateBuildNameWithType("freighter"); // e.g., "Freighter - Echo of the Void"
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
