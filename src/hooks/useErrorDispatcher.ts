// src/hooks/useErrorDispatcher.ts
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useErrorStore } from "@/store/app/errorStore";
import { useSessionStore } from "@/store/app/sessionStore";

/**
 * Maps session counter thresholds to error message keys.
 *
 * @category Constants
 *
 * @private
 */
const ERROR_THRESHOLDS = {
	grid_fixed: {
		messageKey: "restrictions.gridFixed",
		threshold: 3,
		type: "warning" as const,
	},
	module_locked: {
		messageKey: "restrictions.moduleLocked",
		threshold: 3,
		type: "warning" as const,
	},
	row_limit: {
		messageKey: "restrictions.rowLimit",
		threshold: 3,
		type: "warning" as const,
	},
	supercharged_fixed: {
		messageKey: "restrictions.superchargedFixed",
		threshold: 3,
		type: "warning" as const,
	},
	supercharged_limit: {
		messageKey: "restrictions.superchargedLimit",
		threshold: 3,
		type: "warning" as const,
	},
};

/**
 * Monitors session counters and dispatches user-friendly error messages when thresholds are reached.
 *
 * This hook evaluates violations of application constraints (e.g., trying to supercharge
 * too many cells) and queues notifications in the `ErrorStore`. It uses a ref to ensure
 * each threshold violation is only reported once per session.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link useErrorStore} for error dispatching.
 * @see {@link useSessionStore} for counter values.
 * @see [SessionStore Source](../store/app/sessionStore.ts)
 * @see [ErrorStore Source](../store/app/errorStore.ts)
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   useErrorDispatcher();
 *   return <div>Monitoring session violations...</div>;
 * };
 * ```
 */
export const useErrorDispatcher = () => {
	const { t } = useTranslation();
	const { grid_fixed, module_locked, row_limit, supercharged_fixed, supercharged_limit } =
		useSessionStore();
	const { addError } = useErrorStore();

	// Track which thresholds have been triggered to avoid duplicate errors
	const triggeredRef = useRef({
		grid_fixed: false,
		module_locked: false,
		row_limit: false,
		supercharged_fixed: false,
		supercharged_limit: false,
	});

	// Reset triggered flags when session resets (all counters back to 0)
	useEffect(() => {
		if (
			supercharged_limit === 0 &&
			supercharged_fixed === 0 &&
			grid_fixed === 0 &&
			module_locked === 0 &&
			row_limit === 0
		) {
			triggeredRef.current = {
				grid_fixed: false,
				module_locked: false,
				row_limit: false,
				supercharged_fixed: false,
				supercharged_limit: false,
			};
		}
	}, [supercharged_limit, supercharged_fixed, grid_fixed, module_locked, row_limit]);

	useEffect(() => {
		if (
			supercharged_limit >= ERROR_THRESHOLDS.supercharged_limit.threshold &&
			!triggeredRef.current.supercharged_limit
		) {
			triggeredRef.current.supercharged_limit = true;
			const message = t(ERROR_THRESHOLDS.supercharged_limit.messageKey, {
				count: supercharged_limit,
			});
			addError(message, ERROR_THRESHOLDS.supercharged_limit.type);
		}
	}, [supercharged_limit, addError, t]);

	useEffect(() => {
		if (
			supercharged_fixed >= ERROR_THRESHOLDS.supercharged_fixed.threshold &&
			!triggeredRef.current.supercharged_fixed
		) {
			triggeredRef.current.supercharged_fixed = true;
			const message = t(ERROR_THRESHOLDS.supercharged_fixed.messageKey, {
				count: supercharged_fixed,
			});
			addError(message, ERROR_THRESHOLDS.supercharged_fixed.type);
		}
	}, [supercharged_fixed, addError, t]);

	useEffect(() => {
		if (
			grid_fixed >= ERROR_THRESHOLDS.grid_fixed.threshold &&
			!triggeredRef.current.grid_fixed
		) {
			triggeredRef.current.grid_fixed = true;
			const message = t(ERROR_THRESHOLDS.grid_fixed.messageKey, { count: grid_fixed });
			addError(message, ERROR_THRESHOLDS.grid_fixed.type);
		}
	}, [grid_fixed, addError, t]);

	useEffect(() => {
		if (
			module_locked >= ERROR_THRESHOLDS.module_locked.threshold &&
			!triggeredRef.current.module_locked
		) {
			triggeredRef.current.module_locked = true;
			const message = t(ERROR_THRESHOLDS.module_locked.messageKey, { count: module_locked });
			addError(message, ERROR_THRESHOLDS.module_locked.type);
		}
	}, [module_locked, addError, t]);

	useEffect(() => {
		if (row_limit >= ERROR_THRESHOLDS.row_limit.threshold && !triggeredRef.current.row_limit) {
			triggeredRef.current.row_limit = true;
			const message = t(ERROR_THRESHOLDS.row_limit.messageKey, { count: row_limit });
			addError(message, ERROR_THRESHOLDS.row_limit.type);
		}
	}, [row_limit, addError, t]);
};
