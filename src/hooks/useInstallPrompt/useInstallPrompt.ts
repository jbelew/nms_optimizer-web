import { useCallback, useEffect, useState } from "react";

const isIOS = () => {
	const userAgent = window.navigator.userAgent.toLowerCase();
	return /iphone|ipad|ipod/.test(userAgent);
};

const isInStandaloneMode = () => "standalone" in window.navigator && window.navigator.standalone;

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
