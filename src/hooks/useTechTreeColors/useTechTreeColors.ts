// src/hooks/useTechTreeColors/useTechTreeColors.ts
import { use } from "react";

import { fetchTechTreeColors } from "@/utils/api/techTreeColorsResource";

/**
 * Custom hook for retrieving the global technology color registry.
 *
 * @remarks
 * This hook uses React's `use()` for promise unwrapping, allowing it to be used
 * within Suspense boundaries. It provides a mapping of technology keys to their
 * assigned UI theme colors across all categories (Starship, Multi-Tool, etc.).
 *
 * @param {boolean} [enabled=true] - Whether to execute the fetch.
 *
 * @returns {Record<string, string>} A dictionary mapping tech keys to color strings.
 *
 * @see {@link fetchTechTreeColors} for the underlying resource registry.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const TechBadge = ({ techKey }: { techKey: string }) => {
 *   const colors = useTechTreeColors();
 *   const color = colors[techKey] || 'gray';
 *
 *   return <Badge color={color}>{techKey}</Badge>;
 * };
 * ```
 */
export const useTechTreeColors = (enabled: boolean = true) => {
	if (!enabled) {
		return {};
	}

	return use(fetchTechTreeColors());
};
