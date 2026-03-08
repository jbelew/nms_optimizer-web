import { useToast } from "../../hooks/useToast/useToast";
import { NmsToast } from "./Toast";

/**
 * A non-rendering observer component that manages the display of the active toast notification.
 *
 * It listens to the `ToastContext` and renders a single `NmsToast` instance
 * when a configuration is present. This component should be mounted once at
 * the application's root to avoid multiple overlapping notification systems.
 *
 * @returns {JSX.Element | null} The rendered toast notification, or `null` if none are active.
 *
 * @example
 * <ToastRenderer />
 */
export const ToastRenderer = () => {
	const { toastConfig, isOpen, closeToast } = useToast();

	if (!toastConfig) {
		return null;
	}

	return (
		<NmsToast
			key={toastConfig.id}
			open={isOpen}
			onOpenChange={closeToast}
			title={toastConfig.title}
			description={toastConfig.description}
			variant={toastConfig.variant}
			duration={toastConfig.duration}
		/>
	);
};
