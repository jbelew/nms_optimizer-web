import type {
	validateToggleActive,
	validateToggleSupercharged,
	ValidationResult,
} from "./gridRules";
import type { UiActions } from "@/store/ui/uiStore";

import { useUiStore } from "@/store/ui/uiStore";

type ValidationReason = Extract<ValidationResult, { valid: false }>["reason"];

const feedbackMap: Record<ValidationReason, keyof UiActions> = {
	gridFixed: "incrementGridFixedCount",
	moduleLocked: "incrementModuleLockedCount",
	rowLimit: "incrementRowLimitCount",
	superchargedFixed: "incrementSuperchargedFixedCount",
	superchargedLimit: "incrementSuperchargedLimitCount",
};

/**
 * Applies UI feedback for a failed validation check.
 *
 * @remarks
 * Maps the validation failure reason to the corresponding UI counter action in
 * {@link useUiStore} and triggers the shake animation.
 *
 * @param {ValidationResult} result - The validation result containing the reason for failure.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link validateToggleActive}
 * @see {@link validateToggleSupercharged}
 * @see {@link useUiStore}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const result = validateToggleActive({ cell, gridFixed });
 * if (!result.valid) {
 *   applyValidationFeedback(result);
 * }
 * ```
 */
export function applyValidationFeedback(result: ValidationResult): void {
	if (result.valid || !result.reason) {
		return;
	}

	const actionName = feedbackMap[result.reason];

	if (actionName) {
		const uiState = useUiStore.getState();
		const action = uiState[actionName];

		if (typeof action === "function") {
			(action as () => void)();
		}

		uiState.triggerShake();
	}
}
