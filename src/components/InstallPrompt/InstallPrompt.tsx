/**
 * PWA Installation management module.
 *
 * @remarks
 * This module manages PWA installation prompting based on platform capabilities:
 * - On Chromium browsers (Android, Chrome, Edge), it listens for the standard
 *   `beforeinstallprompt` event and prompts the user on return visits.
 * - On iOS Safari, it displays manual 'Add to Home Screen' instructions.
 * - On already installed (standalone) PWAs or unsupported platforms, it remains silent.
 *
 * @see {@link InstallPrompt}
 * @see {@link ./InstallPrompt.stories.tsx Storybook}
 *
 * @category Components
 */

import React, { useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";

import { useToast } from "@/hooks/useToast/useToast";
import { isIosSafari, isStandalone, safeGetItem, safeSetItem } from "@/utils/browser/environment";

/** LocalStorage key for tracking if the user has already dismissed the prompt. */
export const INSTALL_PROMPT_DISMISSED_KEY = "installPromptDismissed";

/** LocalStorage key for tracking if the user has visited the app before. */
export const USER_VISIT_KEY = "userVisited";

/** Event interface for the Chromium beforeinstallprompt event. */
interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	prompt(): Promise<void>;
	readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/**
 * A non-rendering component that manages PWA installation prompts.
 *
 * @remarks
 * Avoids nagging first-time visitors by showing installation nudges starting
 * on the second visit. Tailors prompts to the user's platform:
 * - Direct install prompt for browsers firing `beforeinstallprompt`.
 * - Safari-specific Share menu instructions for iOS Safari.
 * - No-op for already installed apps or browsers without PWA support.
 *
 * @returns {null} Non-rendering component (side-effects only).
 *
 * @component
 *
 * @category Components
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

		// Handler for Chromium / Android / Edge native install prompt
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			const deferredPrompt = e as BeforeInstallPromptEvent;

			const handleInstall = async () => {
				try {
					await deferredPrompt.prompt();
				} finally {
					safeSetItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
				}
			};

			showToast({
				description: (
					<div className="flex flex-col gap-2 pt-1">
						<span>
							{t("installPrompt.installDescription", {
								defaultValue:
									"Install NMS Optimizer for quick access and full-screen experience.",
							})}
						</span>
						<button
							className="self-start rounded bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
							onClick={() => void handleInstall()}
							type="button"
						>
							{t("installPrompt.installButton", { defaultValue: "Install" })}
						</button>
					</div>
				),
				duration: 12000,
				title: t("installPrompt.installTitle", { defaultValue: "Install App" }),
				variant: "success",
			});

			safeSetItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

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
				variant: "success",
			});

			safeSetItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
		}

		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		};
	}, [showToast, t]);

	return null;
};
