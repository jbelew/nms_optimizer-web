import { UI_TIMING } from "@/constants";
import { useGridStore } from "@/store/grid/gridStore";
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";
import { runWhenIdle } from "@/utils/system/idle";
import { Logger } from "@/utils/system/monitoring";

/**
 * Performs idempotent application-level migrations and cleanups.
 *
 * This should be called once during application bootstrap, before the React
 * tree is mounted, to ensure the environment is in a consistent state.
 *
 * @category Utils
 */
export const performBootstrapMigrations = () => {
	if (typeof window === "undefined" || !window.localStorage) {
		return;
	}

	// 1. Tutorial Key Migration (Moved from dialogContext.tsx)
	migrateTutorialKey();

	// 2. Initial Shared Grid Detection (Moved from gridStore module init)
	const isShared = new URLSearchParams(window.location.search).has("grid");

	if (isShared) {
		useGridStore.getState().setIsSharedGrid(true);
	}

	// 3. LocalStorage Garbage Collection (Moved from gridStore.ts)
	// Removes stale gridState keys from previous versions or failed migrations.
	runWhenIdle(performGridCleanup, { timeout: UI_TIMING.IDLE_TIMEOUT_MS });
};

/**
 * Migrates the tutorial flag from the old key to the new key.
 *
 * @private
 */
function migrateTutorialKey() {
	const oldTutorialKey = "hasVisitedNMSOptimizer";
	const newTutorialKey = "tutorialFinished";
	const oldTutorialVal = safeGetItem(oldTutorialKey);
	const newTutorialVal = safeGetItem(newTutorialKey);

	if (newTutorialVal !== "true" && oldTutorialVal === "true") {
		safeSetItem(newTutorialKey, "true");
		safeRemoveItem(oldTutorialKey);
	}
}

/**
 * Scans localStorage and removes stale gridState keys.
 *
 * @private
 */
function performGridCleanup() {
	try {
		const len = localStorage.length;
		const keysToRemove: string[] = [];
		const activeKey = "gridState";

		for (let i = 0; i < len; i++) {
			const key = localStorage.key(i);

			// Remove any key that starts with gridState but is not the primary key
			if (key && key.startsWith("gridState") && key !== activeKey) {
				keysToRemove.push(key);
			}
		}

		keysToRemove.forEach((key) => {
			safeRemoveItem(key);
		});
	} catch (e) {
		Logger.warn("Bootstrap: Failed to perform grid storage cleanup.", {
			error: e,
		});
	}
}
