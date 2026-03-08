// src/hooks/useTechTreeColors/useTechTreeColors.ts
import { use } from "react";

import { fetchTechTreeColors } from "./techTreeColorsResource";

/**
 * Custom hook for retrieving the global technology color registry.
 *
 * This hook uses React's `use` for promise unwrapping, allowing it to be used
 * within Suspense boundaries. It provides a mapping of technology keys to their
 * assigned UI theme colors.
 *
 * @param {boolean} [enabled=true] - Whether to execute the fetch. Defaults to `true`.
 * @returns {Record<string, string>} A dictionary mapping tech keys to color strings.
 *
 * @example
 * const colors = useTechTreeColors();
 */
export const useTechTreeColors = (enabled: boolean = true) => {
	if (!enabled) {
		return {};
	}

	return use(fetchTechTreeColors());
};
