import { useCallback, useState } from "react";

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
	const [showPrompt, setShowPrompt] = useState(true);

	const dismissPrompt = useCallback(() => {
		setShowPrompt(false);
	}, []);

	return { showPrompt, dismissPrompt };
};
