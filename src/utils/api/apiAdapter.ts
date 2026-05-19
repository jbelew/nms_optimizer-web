/**
 * API translation adapters to map backend snake_case fields to camelCase internally,
 * and vice-versa, preventing snake_case wire-format contamination inside UI components.
 *
 * @category Utilities
 */

/**
 * Recursively converts camelCase keys of an object to snake_case.
 *
 * @param {unknown} obj - The object to convert.
 *
 * @returns {unknown} The converted object with snake_case keys.
 *
 * @example
 * ```typescript
 * const snake = camelToSnake({ adjacencyBonus: 0.1, groupAdjacent: true });
 * // returns { adjacency_bonus: 0.1, group_adjacent: true }
 * ```
 */
export function camelToSnake(obj: unknown): unknown {
	if (obj === null || obj === undefined) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(camelToSnake);
	}

	if (
		typeof obj === "object" &&
		!(obj instanceof Set) &&
		!(obj instanceof Map) &&
		!(obj instanceof Date)
	) {
		const newObj: Record<string, unknown> = {};
		const record = obj as Record<string, unknown>;

		for (const key of Object.keys(record)) {
			const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
			newObj[snakeKey] = camelToSnake(record[key]);
		}

		return newObj;
	}

	return obj;
}

/**
 * Recursively converts snake_case keys of an object to camelCase.
 *
 * @param {unknown} obj - The object to convert.
 *
 * @returns {unknown} The converted object with camelCase keys.
 *
 * @example
 * ```typescript
 * const camel = snakeToCamel({ adjacency_bonus: 0.1, group_adjacent: true });
 * // returns { adjacencyBonus: 0.1, groupAdjacent: true }
 * ```
 */
export function snakeToCamel(obj: unknown): unknown {
	if (obj === null || obj === undefined) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(snakeToCamel);
	}

	if (
		typeof obj === "object" &&
		!(obj instanceof Set) &&
		!(obj instanceof Map) &&
		!(obj instanceof Date)
	) {
		const newObj: Record<string, unknown> = {};
		const record = obj as Record<string, unknown>;

		for (const key of Object.keys(record)) {
			const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
			newObj[camelKey] = snakeToCamel(record[key]);
		}

		return newObj;
	}

	return obj;
}
