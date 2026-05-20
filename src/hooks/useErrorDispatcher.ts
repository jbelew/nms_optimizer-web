// src/hooks/useErrorDispatcher.ts
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useErrorStore, useSessionStore } from "@/store/ui/uiStore";

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
 * @remarks
 * This hook evaluates violations of application constraints (e.g., trying to supercharge
 * too many cells) and queues notifications in the `ErrorStore`. It uses a ref to ensure
 * each threshold violation is only reported once per session.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link useErrorStore} for error dispatching.
 * @see {@link useSessionStore} for counter values.
 * @see {@link ../store/ui/uiStore.ts SessionStore Source}
 * @see {@link ../store/ui/uiStore.ts ErrorStore Source}
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

	// Reset triggered flags when session resets (all counters back to 0),
	// otherwise evaluate each constraint counter against its threshold.
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

			return;
		}

		const counters = {
			grid_fixed,
			module_locked,
			row_limit,
			supercharged_fixed,
			supercharged_limit,
		};

		(Object.keys(ERROR_THRESHOLDS) as Array<keyof typeof ERROR_THRESHOLDS>).forEach((key) => {
			const config = ERROR_THRESHOLDS[key];
			const currentValue = counters[key];

			if (currentValue >= config.threshold && !triggeredRef.current[key]) {
				triggeredRef.current[key] = true;
				const message = t(config.messageKey, { count: currentValue });
				addError(message, config.type);
			}
		});
	}, [supercharged_limit, supercharged_fixed, grid_fixed, module_locked, row_limit, addError, t]);
};
