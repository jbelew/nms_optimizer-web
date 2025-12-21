import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useToast } from "@/hooks/useToast/useToast";
import { useErrorStore } from "@/store/ErrorStore";

/**
 * ErrorMessageRenderer component displays error messages from the ErrorStore using toast notifications.
 * Should be mounted at the top level of the app, preferably in MainAppContent or App component.
 * Automatically queues errors from the session error tracking system.
 *
 * @returns {null} Does not render any DOM elements
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
