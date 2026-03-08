import { useState } from "react";

/**
 * Custom hook for managing the visibility of the iOS PWA install prompt.
 *
 * This hook provides a simple state toggle for the install prompt. The logic for
 * determining if the device is iOS and not in standalone mode is typically handled
 * at the component level using this hook.
 *
 * @returns {{ showPrompt: boolean, dismissPrompt: function(): void }} State for prompt visibility and a handler to dismiss it.
 *
 * @example
 * const { showPrompt, dismissPrompt } = useInstallPrompt();
 * if (showPrompt) {
 *   return <IOSInstallPrompt onDismiss={dismissPrompt} />;
 * }
 */
export const useInstallPrompt = () => {
	const [showPrompt, setShowPrompt] = useState(true);

	/**
	 * Dismisses the install prompt.
	 */
	const dismissPrompt = () => {
		setShowPrompt(false);
	};

	return { showPrompt, dismissPrompt };
};
