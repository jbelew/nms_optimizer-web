// src/hooks/useTechTreeColors/useTechTreeColors.ts
import { use } from "react";

import { fetchTechTreeColors } from "./techTreeColorsResource";

/**
 * Custom hook to fetch the tech tree colors for all ship types.
 * Uses cached fetches to avoid redundant API calls.
 * Only fetches when enabled to avoid unnecessary requests for users not viewing stats.
 *
 * @param {boolean} [enabled=true] - Whether to fetch the colors.
 * @returns {Record<string, string>} An object containing the tech colors.
 */
export const useTechTreeColors = (enabled: boolean = true) => {
	if (!enabled) {
		return {};
	}

	return use(fetchTechTreeColors());
};
