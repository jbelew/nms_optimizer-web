import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useToast } from "../../hooks/useToast/useToast";
import { isTouchDevice } from "../../utils/isTouchDevice";

const INSTALL_PROMPT_DISMISSED_KEY = "installPromptDismissed";
const USER_VISIT_KEY = "userVisited";

export const InstallPrompt: React.FC = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();

	// Capture the visit state once on component mount.
	// This ensures that even if the effect re-runs in the same session,
	// we still treat it as the "first visit" based on the state when the page loaded.
	const wasVisitedRef = useRef(!!localStorage.getItem(USER_VISIT_KEY));

	useEffect(() => {
		const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
		const isDismissed = localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY);
		const hadVisitedBeforeLoad = wasVisitedRef.current;

		if (!isInstalled && !isDismissed && hadVisitedBeforeLoad && isTouchDevice()) {
			const description = t("installPrompt.iosInstructions");

			showToast({
				title: t("installPrompt.title"),
				description: <div dangerouslySetInnerHTML={{ __html: description }} />,
				variant: "success",
				duration: 10000,
			});

			localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
		}

		// Mark user as having visited. This setting in localStorage will be picked up
		// by wasVisitedRef.current in the NEXT session (page refresh/revisit).
		if (!hadVisitedBeforeLoad) {
			localStorage.setItem(USER_VISIT_KEY, "true");
		}
	}, [showToast, t]);

	return null;
};
