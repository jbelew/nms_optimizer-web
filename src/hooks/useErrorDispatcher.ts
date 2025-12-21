// src/hooks/useErrorDispatcher.ts
import { useEffect, useRef } from "react";
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

	// Track which thresholds have been triggered to avoid duplicate errors
	const triggeredRef = useRef({
		supercharged_limit: false,
		supercharged_fixed: false,
		grid_fixed: false,
		module_locked: false,
		row_limit: false,
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
				supercharged_limit: false,
				supercharged_fixed: false,
				grid_fixed: false,
				module_locked: false,
				row_limit: false,
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
