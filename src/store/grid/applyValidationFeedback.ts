import i18n from "i18next";

import type { UiActions, UiStore } from "@/store/ui/uiStore";
import { showGlobalError } from "@/hooks/useToast/useToast";
import { usePlatformStore } from "@/store/app/platformStore";
import { useUiStore } from "@/store/ui/uiStore";
import { sendEvent } from "@/utils/analytics/tracking";

import type {
	validateToggleActive,
	validateToggleSupercharged,
	ValidationResult,
} from "./gridRules";

type RestrictionCountKey =
	| "gridFixedCount"
	| "moduleLockedCount"
	| "rowLimitCount"
	| "superchargedFixedCount"
	| "superchargedLimitCount";

type ValidationReason = Extract<ValidationResult, { valid: false }>["reason"];

/** Number of violations of the same Slot Restriction in a session before surfacing a warning toast. */
const RESTRICTION_WARNING_THRESHOLD = 3;

/** Duration in milliseconds for the Slot Restriction warning toast. */
const RESTRICTION_TOAST_DURATION_MS = 5000;

const feedbackMap: Record<
	ValidationReason,
	{ action: keyof UiActions; countKey: RestrictionCountKey }
> = {
	gridFixed: { action: "incrementGridFixedCount", countKey: "gridFixedCount" },
	moduleLocked: { action: "incrementModuleLockedCount", countKey: "moduleLockedCount" },
	rowLimit: { action: "incrementRowLimitCount", countKey: "rowLimitCount" },
	superchargedFixed: {
		action: "incrementSuperchargedFixedCount",
		countKey: "superchargedFixedCount",
	},
	superchargedLimit: {
		action: "incrementSuperchargedLimitCount",
		countKey: "superchargedLimitCount",
	},
};

/**
 * Applies Slot Restriction feedback for a failed cell validation check.
 *
 * @remarks
 * Increments the corresponding session restriction counter in {@link useUiStore},
 * triggers the grid shake animation, and—on the 3rd violation of the same
 * restriction in a session—dispatches a localized warning toast once.
 *
 * @param result - The validation result containing the reason for failure.
 *
 * @returns Side-effects only.
 *
 * @see {@link validateToggleActive}
 * @see {@link validateToggleSupercharged}
 * @see {@link useUiStore}
 * @see {@link showGlobalError}
 * @see {@link ./actionsValidation.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const result = validateToggleActive({ cell, gridFixed });
 * if (!result.valid) {
 *   applyValidationFeedback(result);
 * }
 * // increments counter, shakes grid, and toasts on 3rd attempt
 * ```
 */
export function applyValidationFeedback(result: ValidationResult): void {
	if (result.valid || !result.reason) {
		return;
	}

	const entry = feedbackMap[result.reason];

	if (entry) {
		const uiState: UiStore = useUiStore.getState();
		const action = uiState[entry.action];

		if (typeof action === "function") {
			(action as () => void)();
		}

		uiState.triggerShake();

		const nextCount = useUiStore.getState()[entry.countKey];

		if (nextCount === RESTRICTION_WARNING_THRESHOLD) {
			const messageKey = `restrictions.${result.reason}`;
			const title =
				i18n.t("restrictions.title", { defaultValue: "restrictions.title" })
				|| "restrictions.title";
			const description =
				i18n.t(messageKey, { count: nextCount, defaultValue: messageKey }) || messageKey;

			showGlobalError(title, description, RESTRICTION_TOAST_DURATION_MS);
			sendEvent({
				action: "slot_restriction_warning",
				category: "ui",
				nonInteraction: false,
				platform: usePlatformStore.getState().selectedPlatform,
				reason: result.reason,
				value: 1,
			});
		}
	}
}
