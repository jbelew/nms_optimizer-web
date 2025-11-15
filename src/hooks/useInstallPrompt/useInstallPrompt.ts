import { useCallback, useEffect, useState } from "react";

/**
 * Detects if the current device is running iOS.
 * @returns {boolean} True if the device is running iOS.
 */
const isIOS = () => {
	const userAgent = window.navigator.userAgent.toLowerCase();
	return /iphone|ipad|ipod/.test(userAgent);
};

/**
 * Detects if the app is running in standalone mode (installed as a PWA).
 * @returns {boolean} True if the app is in standalone mode.
 */
const isInStandaloneMode = () => "standalone" in window.navigator && window.navigator.standalone;

/**
 * Custom hook for managing the iOS install prompt.
 * Shows a prompt for adding the app to the home screen on iOS devices
 * that are not already in standalone mode.
 *
 * @returns {{showPrompt: boolean, dismissPrompt: () => void}} An object containing the prompt visibility state and a dismiss function.
 *
 * @example
 * const { showPrompt, dismissPrompt } = useInstallPrompt();
 * if (showPrompt) {
 *   return <IOSInstallPrompt onDismiss={dismissPrompt} />;
 * }
 */
export const useInstallPrompt = () => {
	const [showPrompt, setShowPrompt] = useState(false);

	useEffect(() => {
		// Only show prompt on iOS Safari and if not already in standalone mode
		if (isIOS() && !isInStandaloneMode()) {
			// We can't directly detect if "Add to Home Screen" is available,
			// but we can assume it's relevant if not in standalone mode on iOS.
			// For simplicity, show it once per session.
			// Use a timeout to avoid synchronous setState in effect, which can cause cascading renders.
			// This also ensures the check happens after the initial render.
			setTimeout(() => {
				const hasDismissed = sessionStorage.getItem("iosInstallPromptDismissed");
				if (!hasDismissed) {
					setShowPrompt(true);
				}
			});
		}
	}, []);

	const dismissPrompt = useCallback(() => {
		setShowPrompt(false);
		// sessionStorage.setItem('iosInstallPromptDismissed', 'true');
	}, []);

	return { showPrompt, dismissPrompt };
};
