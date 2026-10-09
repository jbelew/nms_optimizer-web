/**
 * PWA Installation management module.
 *
 * @remarks
 * This module manages PWA installation prompting tailored to platform capabilities:
 * - On iOS Safari, which lacks native install events and omnibox install buttons,
 *   it displays subtle instructions to use the 'Add to Home Screen' action via Safari's Share menu.
 * - On Chromium platforms (Android, Chrome, Edge), installation is delegated entirely
 *   to native browser mechanisms (Omnibox install icon on desktop, native infobar and
 *   overflow menu on Android) without disruptive custom prompts.
 * - On already installed (standalone) PWAs or previously dismissed sessions, it remains silent.
 *
 * @see {@link InstallPrompt}
 * @see {@link ./InstallPrompt.stories.tsx Storybook}
 * @see {@link ./InstallPrompt.test.tsx Unit Tests}
 *
 * @category Components
 */

import React, { useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";

import { useToast } from "@/hooks/useToast/useToast";
import { isIosSafari, isStandalone, safeGetItem, safeSetItem } from "@/utils/browser/environment";

/**
 * LocalStorage key for tracking if the user has already dismissed the prompt.
 *
 * @category Utilities
 */
export const INSTALL_PROMPT_DISMISSED_KEY = "installPromptDismissed";

/**
 * LocalStorage key for tracking if the user has visited the app before.
 *
 * @category Utilities
 */
export const USER_VISIT_KEY = "userVisited";

/**
 * A non-rendering component that manages PWA installation prompts.
 *
 * @remarks
 * Avoids nagging first-time visitors by showing installation nudges starting
 * on the second visit. For iOS Safari users, it presents instructions for manual
 * addition to the Home Screen. For all other platforms, it allows native browser
 * install mechanisms to handle installation without obstruction.
 *
 * @returns {null} Non-rendering component (side-effects only).
 *
 * @see {@link useToast}
 * @see {@link ./InstallPrompt.test.tsx Unit Tests}
 * @see {@link ./InstallPrompt.stories.tsx Storybook}
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

	const wasVisitedRef = useRef(Boolean(safeGetItem(USER_VISIT_KEY)));

	useEffect(() => {
		// Mark user as visited for subsequent sessions
		if (!wasVisitedRef.current) {
			safeSetItem(USER_VISIT_KEY, "true");

			return;
		}

		// Don't prompt if already running in standalone PWA mode or previously dismissed
		if (isStandalone() || safeGetItem(INSTALL_PROMPT_DISMISSED_KEY)) {
			return;
		}

		// iOS Safari does not support beforeinstallprompt; show platform-specific instructions
		if (isIosSafari()) {
			showToast({
				description: (
					<Trans
						components={{ strong: <strong /> }}
						i18nKey="installPrompt.iosInstructions"
					/>
				),
				duration: 10000,
				title: t("installPrompt.title"),
			});

			safeSetItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
		}
	}, [showToast, t]);

	return null;
};
