/**
 * PWA Installation management module.
 *
 * @remarks
 * This module contains the `InstallPrompt` logic, which intelligently nudges
 * mobile users to install the application as a PWA after their initial visit.
 *
 * @see {@link InstallPrompt}
 * @see {@link ./InstallPrompt.stories.tsx Storybook}
 *
 * @category Components
 */

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useToast } from "@/hooks/useToast/useToast";
import { isTouchDevice, safeGetItem, safeSetItem } from "@/utils/browser/environment";

/** LocalStorage key for tracking if the user has already dismissed the prompt. */
const INSTALL_PROMPT_DISMISSED_KEY = "installPromptDismissed";
/** LocalStorage key for tracking if the user has visited the app before. */
const USER_VISIT_KEY = "userVisited";

/**
 * A non-rendering component that manages the PWA installation prompt logic.
 *
 * @remarks
 * It uses a heuristic to determine if the user is on a mobile device and hasn't
 * installed the app yet. To avoid annoying new users, it only shows the
 * prompt starting from the second visit. It uses the `Toast` system to
 * display installation instructions (specifically tailored for iOS).
 *
 * @returns {null} This component does not render any visual elements.
 *
 * @see {@link useToast}
 * @see {@link isTouchDevice}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <InstallPrompt />
 * // returns null (side-effects only)
 * ```
 */
export const InstallPrompt: React.FC = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();

	// Capture the visit state once on component mount.
	// This ensures that even if the effect re-runs in the same session,
	// we still treat it as the "first visit" based on the state when the page loaded.
	const wasVisitedRef = useRef(!!safeGetItem(USER_VISIT_KEY));

	useEffect(() => {
		const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
		const isDismissed = safeGetItem(INSTALL_PROMPT_DISMISSED_KEY);
		const hadVisitedBeforeLoad = wasVisitedRef.current;

		if (!isInstalled && !isDismissed && hadVisitedBeforeLoad && isTouchDevice()) {
			const description = t("installPrompt.iosInstructions");

			showToast({
				description: <div dangerouslySetInnerHTML={{ __html: description }} />,
				duration: 10000,
				title: t("installPrompt.title"),
				variant: "success",
			});

			safeSetItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
		}

		// Mark user as having visited. This setting in localStorage will be picked up
		// by wasVisitedRef.current in the NEXT session (page refresh/revisit).
		if (!hadVisitedBeforeLoad) {
			safeSetItem(USER_VISIT_KEY, "true");
		}
	}, [showToast, t]);

	return null;
};
