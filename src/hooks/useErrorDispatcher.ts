// src/hooks/useErrorDispatcher.ts
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useErrorStore } from "@/store/ErrorStore";
import { useSessionStore } from "@/store/SessionStore";

/**
 * Maps session counter thresholds to error message keys.
 * Evaluates session counters and dispatches error messages when thresholds are exceeded.
 */
const ERROR_THRESHOLDS = {
	supercharged_limit: {
		threshold: 3,
		messageKey: "restrictions.superchargedLimit",
		type: "warning" as const,
	},
	supercharged_fixed: {
		threshold: 3,
		messageKey: "restrictions.superchargedFixed",
		type: "warning" as const,
	},
	grid_fixed: {
		threshold: 3,
		messageKey: "restrictions.gridFixed",
		type: "warning" as const,
	},
	module_locked: {
		threshold: 3,
		messageKey: "restrictions.moduleLocked",
		type: "warning" as const,
	},
	row_limit: {
		threshold: 3,
		messageKey: "restrictions.rowLimit",
		type: "warning" as const,
	},
};

/**
 * Custom hook for evaluating session counters and dispatching error messages.
 * Monitors session store for constraint violations and automatically creates
 * user-friendly error notifications.
 *
 * @example
 * function App() {
 *   useErrorDispatcher();
 *   // Error messages will be queued automatically when thresholds are exceeded
 * }
 */
export const useErrorDispatcher = () => {
	const { t } = useTranslation();
	const { supercharged_limit, supercharged_fixed, grid_fixed, module_locked, row_limit } =
		useSessionStore();
	const { addError } = useErrorStore();

	useEffect(() => {
		// Show error once when threshold is first reached
		if (supercharged_limit === ERROR_THRESHOLDS.supercharged_limit.threshold) {
			const message = t(ERROR_THRESHOLDS.supercharged_limit.messageKey, {
				count: supercharged_limit,
			});
			addError(message, ERROR_THRESHOLDS.supercharged_limit.type);
		}
	}, [supercharged_limit, addError, t]);

	useEffect(() => {
		// Show error once when threshold is first reached
		if (supercharged_fixed === ERROR_THRESHOLDS.supercharged_fixed.threshold) {
			const message = t(ERROR_THRESHOLDS.supercharged_fixed.messageKey, {
				count: supercharged_fixed,
			});
			addError(message, ERROR_THRESHOLDS.supercharged_fixed.type);
		}
	}, [supercharged_fixed, addError, t]);

	useEffect(() => {
		// Show error once when threshold is first reached
		if (grid_fixed === ERROR_THRESHOLDS.grid_fixed.threshold) {
			const message = t(ERROR_THRESHOLDS.grid_fixed.messageKey, { count: grid_fixed });
			addError(message, ERROR_THRESHOLDS.grid_fixed.type);
		}
	}, [grid_fixed, addError, t]);

	useEffect(() => {
		// Show error once when threshold is first reached
		if (module_locked === ERROR_THRESHOLDS.module_locked.threshold) {
			const message = t(ERROR_THRESHOLDS.module_locked.messageKey, { count: module_locked });
			addError(message, ERROR_THRESHOLDS.module_locked.type);
		}
	}, [module_locked, addError, t]);

	useEffect(() => {
		// Show error once when threshold is first reached
		if (row_limit === ERROR_THRESHOLDS.row_limit.threshold) {
			const message = t(ERROR_THRESHOLDS.row_limit.messageKey, { count: row_limit });
			addError(message, ERROR_THRESHOLDS.row_limit.type);
		}
	}, [row_limit, addError, t]);
};
