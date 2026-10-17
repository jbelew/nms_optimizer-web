/**
 * Solver Window dimension calculation utilities.
 *
 * @remarks
 * Provides pure client-side evaluation of the `[width, height]` Solver Window
 * dimensions required for a given active module count and technology window rules,
 * mirroring the backend capacity escalation logic.
 *
 * @see {@link ./windowDimensions.test.ts Unit Tests}
 *
 * @category Utilities
 */

import type { WindowDimensions, WindowRules } from "@/types/tech";

/**
 * Standard baseline Solver Window profile mapping module count thresholds to `[width, height]` dimensions.
 *
 * @category Utilities
 */
export const STANDARD_WINDOW_RULES: Readonly<WindowRules> = {
	"1": [1, 1],
	"2": [2, 1],
	"4": [2, 2],
	"6": [3, 2],
	"9": [3, 3],
	"12": [4, 3],
	default: [4, 4],
};

/**
 * Determines the optimal `[width, height]` Solver Window dimensions for a given module count.
 *
 * @remarks
 * Evaluates the provided `windowRules` (or {@link STANDARD_WINDOW_RULES} when omitted/empty)
 * by checking for an exact numeric key match, falling back to the nearest higher numeric
 * threshold, and then to `"default"`. If the resolved area (`width * height`) cannot
 * physically fit `count`, dimensions are escalated to the technology's `"default"` rule
 * or the smallest fitting rule in {@link STANDARD_WINDOW_RULES}.
 *
 * @param {number} count - The number of active modules selected for optimization.
 * @param {WindowRules | null} [windowRules] - Optional mapping of module count thresholds or `"default"` to `[width, height]` dimensions.
 *
 * @returns {WindowDimensions | null} The resolved `[width, height]` Solver Window dimensions, or `null` when `count < 1`.
 *
 * @default STANDARD_WINDOW_RULES
 *
 * @see {@link STANDARD_WINDOW_RULES}
 * @see {@link WindowDimensions}
 * @see {@link WindowRules}
 * @see {@link ./windowDimensions.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const dimensions = determineWindowDimensions(5, STANDARD_WINDOW_RULES);
 * // returns [3, 2]
 * ```
 */
export function determineWindowDimensions(
	count: number,
	windowRules?: null | WindowRules
): null | WindowDimensions {
	if (!Number.isFinite(count) || count < 1) {
		return null;
	}

	const normalizedCount = Math.floor(count);
	const rules =
		windowRules && Object.keys(windowRules).length > 0 ? windowRules : STANDARD_WINDOW_RULES;
	const countKey = String(normalizedCount);

	let width = 1;
	let height = 1;

	if (countKey in rules && rules[countKey]) {
		[width, height] = rules[countKey];
	} else {
		const nearestHigherRule = findSmallestNumericRule(
			rules,
			(threshold) => threshold > normalizedCount
		);

		if (nearestHigherRule) {
			[width, height] = nearestHigherRule;
		} else if ("default" in rules && rules.default) {
			[width, height] = rules.default;
		}
	}

	// Capacity safety escalation: ensure width * height >= normalizedCount
	if (width * height < normalizedCount) {
		if (
			"default" in rules &&
			rules.default &&
			rules.default[0] * rules.default[1] >= normalizedCount
		) {
			[width, height] = rules.default;
		} else {
			const fittingStandardRule = findSmallestNumericRule(
				STANDARD_WINDOW_RULES,
				(_threshold, [stdWidth, stdHeight]) => stdWidth * stdHeight >= normalizedCount
			);

			if (fittingStandardRule) {
				[width, height] = fittingStandardRule;
			} else {
				[width, height] = STANDARD_WINDOW_RULES.default;
			}
		}
	}

	if (width * height < normalizedCount) {
		const escalatedWidth = Math.max(width, Math.ceil(Math.sqrt(normalizedCount)));
		const escalatedHeight = Math.max(height, Math.ceil(normalizedCount / escalatedWidth));

		return [escalatedWidth, escalatedHeight];
	}

	return [width, height];
}

/**
 * Finds the dimensions associated with the smallest numeric threshold key in `rules`
 * that satisfies `predicate`.
 *
 * @param {Readonly<WindowRules>} rules - Window rules dictionary to inspect.
 * @param {(threshold: number, dimensions: WindowDimensions) => boolean} predicate - Filter condition for candidate numeric thresholds.
 *
 * @returns {WindowDimensions | null} The matching `[width, height]` tuple, or `null` if none match.
 *
 * @category Utilities
 */
function findSmallestNumericRule(
	rules: Readonly<WindowRules>,
	predicate: (threshold: number, dimensions: WindowDimensions) => boolean
): null | WindowDimensions {
	const matchingThresholds = Object.keys(rules)
		.filter((key) => /^\d+$/.test(key) && Boolean(rules[key]))
		.map((key) => Number.parseInt(key, 10))
		.filter((threshold) => predicate(threshold, rules[String(threshold)]));

	if (matchingThresholds.length === 0) {
		return null;
	}

	const smallestKey = String(Math.min(...matchingThresholds));
	const [width, height] = rules[smallestKey];

	return [width, height];
}
