import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useToast } from "../../hooks/useToast/useToast";
import { isTouchDevice } from "../../utils/isTouchDevice";

const INSTALL_PROMPT_DISMISSED_KEY = "installPromptDismissed";
const USER_VISIT_KEY = "userVisited";

export const InstallPrompt: React.FC = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();

	// Mark user as having visited on first mount
	useEffect(() => {
		if (!localStorage.getItem(USER_VISIT_KEY)) {
			localStorage.setItem(USER_VISIT_KEY, "true");
		}
	}, []);

	useEffect(() => {
		const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
		const isDismissed = localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY);
		const hasVisitedBefore = localStorage.getItem(USER_VISIT_KEY);

		if (!isInstalled && !isDismissed && hasVisitedBefore && isTouchDevice()) {
			const description = t("installPrompt.iosInstructions");

			showToast({
				title: t("installPrompt.title"),
				description: <div dangerouslySetInnerHTML={{ __html: description }} />,
				variant: "success",
				duration: 10000,
			});

			localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
		}
	}, [showToast, t]);

	return null;
};
