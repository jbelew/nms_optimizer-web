import type { GridStore } from "./gridTypes";
import type { StorageValue } from "zustand/middleware";

import { UI_TIMING } from "@/constants";
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";
import { resolveInitialPlatform } from "@/utils/browser/platformResolver";
import { Logger } from "@/utils/system/monitoring";

type SetItemFunction = (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void>;

/**
 * Creates a debounced version of a `setItem` function for `localStorage`.
 *
 * This prevents excessive disk writes during rapid state changes (e.g., when
 * a user is rapidly clicking cells).
 *
 * @param {SetItemFunction} setItemFn - The storage setter function to debounce.
 * @param {number} msToWait - Delay in milliseconds. **Must be a positive integer.**
 *
 * @returns {function(string, StorageValue<Partial<GridStore>>): Promise<void>} The debounced setter.
 *
 * @example
 * ```typescript
 * const debouncedSet = debounceSetItem(mySetFn, 500);
 * await debouncedSet("myKey", { state: { ... } });
 * ```
 */
function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<GridStore>>) => Promise<void> {
	let timeoutId: null | number = null;

	return (name: string, value: StorageValue<Partial<GridStore>>): Promise<void> => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = window.setTimeout(() => {
			void (async () => {
				try {
					await setItemFn(name, value);
				} catch (e) {
					Logger.error("Failed to save to localStorage", e);
				}
			})();
		}, msToWait);

		return Promise.resolve();
	};
}

/**
 * A debounced storage wrapper for persisting the `GridStore`.
 *
 * @remarks
 * This object implements a custom storage interface that debounces write operations.
 * It prevents excessive disk I/O when the user is rapidly modifying the grid
 * (e.g., mass-checking modules or moving cells).
 *
 * It handles:
 * 1. **Atomic Reads**: Direct synchronous reads from `localStorage`.
 * 2. **Debounced Writes**: Buffers state changes and writes them after a period of inactivity.
 * 3. **Error Handling**: Gracefully logs and suppresses storage-related exceptions (e.g., QuotaExceededError).
 *
 * @category State
 *
 * @example
 * ```ts
 * const value = debouncedStorage.getItem("grid-data");
 * debouncedStorage.setItem("grid-data", { ...state });
 * ```
 */
export const debouncedStorage = {
	getItem: (name: string): null | StorageValue<Partial<GridStore>> => {
		try {
			const storedData = safeGetItem(name);

			if (!storedData) {
				return null;
			}

			let parsedData: StorageValue<Partial<GridStore> & { selectedPlatform?: string }>;

			try {
				parsedData = JSON.parse(storedData) as StorageValue<
					Partial<GridStore> & { selectedPlatform?: string }
				>;
			} catch (parseError) {
				Logger.error(
					`GridStore: Failed to parse stored data for key "${name}". Data may be corrupted.`,
					parseError
				);

				return null;
			}

			const currentPlatform = resolveInitialPlatform();
			const storedGridPlatform = parsedData.state?.selectedPlatform;

			if (storedGridPlatform && storedGridPlatform !== currentPlatform) {
				Logger.warn(
					`GridStore: Discarding stored grid due to platform mismatch. Stored: ${storedGridPlatform}, Current: ${currentPlatform}`
				);

				return null;
			}

			return parsedData;
		} catch (e) {
			Logger.error("Failed to load from localStorage:", e);

			return null;
		}
	},

	removeItem: (name: string): void => {
		safeRemoveItem(name);
	},

	setItem: debounceSetItem((name: string, value: StorageValue<Partial<GridStore>>) => {
		try {
			const storageValue = JSON.stringify(value);
			const success = safeSetItem(name, storageValue);

			return success ? Promise.resolve() : Promise.reject(new Error("Storage blocked"));
		} catch (e) {
			Logger.error("Failed to save to localStorage:", e);

			if (e instanceof Error) {
				return Promise.reject(e);
			}

			return Promise.reject(new Error(String(e)));
		}
	}, UI_TIMING.DEBOUNCE_SAVE_MS),
};
