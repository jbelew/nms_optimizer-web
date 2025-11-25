import { useToast } from "../../hooks/useToast/useToast";
import { NmsToast } from "./Toast";

/**
 * ToastRenderer component renders the centralized toast notification.
 * Should be mounted at the top level of the app, preferably in MainAppContent or App component.
 * Uses the global toast context to display notifications.
 *
 * @returns {JSX.Element|null} The rendered toast or null if no toast is open.
 */
export const ToastRenderer = () => {
	const { toastConfig, isOpen, closeToast } = useToast();

	if (!toastConfig) {
		return null;
	}

	return (
		<NmsToast
			open={isOpen}
			onOpenChange={closeToast}
			title={toastConfig.title}
			description={toastConfig.description}
			variant={toastConfig.variant}
			duration={toastConfig.duration}
		/>
	);
};
