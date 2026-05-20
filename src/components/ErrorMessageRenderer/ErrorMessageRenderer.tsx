/**
 * Background observer for global error notifications.
 *
 * @remarks
 * This module provides the `ErrorMessageRenderer` component, which automatically
 * surfaces errors from the global state into user-visible toasts.
 *
 * @see {@link ErrorMessageRenderer}
 * @see {@link ./ErrorMessageRenderer.test.tsx Unit Tests}
 *
 * @category Components
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useToast } from "@/hooks/useToast/useToast";
import { useErrorStore } from "@/store/ui/uiStore";

/**
 * A non-rendering observer component that bridges the `ErrorStore` and the `Toast` system.
 *
 * @remarks
 * It monitors the global `ErrorStore` for new error messages. When an error is
 * detected, it triggers a localized error toast and automatically schedules the
 * removal of that error from the store after a fixed duration. This component
 * should be mounted once at the root level of the application.
 *
 * @returns {null} This component does not render any visual elements.
 *
 * @see {@link useErrorStore}
 * @see {@link useToast}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ErrorMessageRenderer />
 * // returns null (side-effects only)
 * ```
 */
export const ErrorMessageRenderer = () => {
	const { t } = useTranslation();
	const { errors, removeError } = useErrorStore();
	const { showError } = useToast();

	useEffect(() => {
		// Display the most recent error
		if (errors.length > 0) {
			const latestError = errors[errors.length - 1];

			showError(t("restrictions.title"), latestError.message, 5000);

			// Remove the error after displaying it (auto-cleanup)
			const timeout = setTimeout(() => {
				removeError(latestError.id);
			}, 5000);

			return () => clearTimeout(timeout);
		}
	}, [errors, showError, removeError, t]);

	return null;
};
