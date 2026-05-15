/**
 * Global toast notification management module.
 *
 * @remarks
 * This module provides the `ToastRenderer` component, which serves as the
 * single mount point for all application-wide toasts.
 *
 * @see {@link ToastRenderer}
 *
 * @category Components
 */

import "./Toast.scss";

import { useToast } from "../../hooks/useToast/useToast";
import { NmsToast } from "./Toast";

/**
 * A non-rendering observer component that manages the display of the active toast notification.
 *
 * @remarks
 * It listens to the `ToastContext` and renders a single `NmsToast` instance
 * when a configuration is present. This component should be mounted once at
 * the application's root to avoid multiple overlapping notification systems.
 *
 * @returns {JSX.Element | null} The rendered toast notification, or `null` if none are active.
 *
 * @see {@link useToast}
 * @see {@link NmsToast}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ToastRenderer />
 * // renders active toast from context
 * ```
 */
export const ToastRenderer = () => {
	const { closeToast, isOpen, toastConfig } = useToast();

	if (!toastConfig) {
		return null;
	}

	return (
		<NmsToast
			description={toastConfig.description}
			duration={toastConfig.duration}
			key={toastConfig.id}
			onOpenChange={closeToast}
			open={isOpen}
			title={toastConfig.title}
			variant={toastConfig.variant}
		/>
	);
};
