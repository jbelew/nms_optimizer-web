import type { ToastConfig, ToastContextType } from "./createToastContext";
import type { ReactNode } from "react";
import React, { useState } from "react";

import { ToastContext } from "./createToastContext";

/**
 * Provider component for the centralized toast notification system.
 *
 * @remarks
 * It manages the visibility, configuration, and automatic dismissal of toasts.
 * It also includes a global event listener to dismiss the active toast when
 * the user clicks or touches anywhere else on the screen.
 *
 * @param {object} props - Component properties.
 * @param {import("react").ReactNode} props.children - The application tree to wrap.
 *
 * @returns {JSX.Element} The provider element wrapping children.
 *
 * @see {@link import('@/hooks/useToast/useToast').useToast} for the consumer hook.
 * @see {@link ToastContext}
 * @see {@link ToastConfig}
 *
 * @component
 *
 * @category Components
 *
 * @example Application wrapper
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toastConfig, setToastConfig] = useState<null | ToastConfig>(null);
	const [isOpen, setIsOpen] = useState(false);

	/**
	 * Activates a new toast notification.
	 *
	 * @param {ToastConfig} config - The settings for the toast.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Manual trigger
	 * ```typescript
	 * showToast({ title: "Updated", description: "Config saved", variant: "success" });
	 * ```
	 */
	const showToast = React.useCallback((config: ToastConfig) => {
		setToastConfig({
			...config,
			id: config.id || Date.now().toString(),
		});
		setIsOpen(true);
	}, []);

	/**
	 * Triggers a success notification.
	 *
	 * @param {string} title - The primary text.
	 * @param {import("react").ReactNode} description - The detailed message.
	 * @param {number} [duration] - Expiry delay in ms.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Success trigger
	 * ```typescript
	 * showSuccess("Success", "Build applied successfully");
	 * ```
	 */
	const showSuccess = React.useCallback(
		(title: string, description: ReactNode, duration?: number) => {
			showToast({ description, duration, title, variant: "success" });
		},
		[showToast]
	);

	/**
	 * Triggers an error notification.
	 *
	 * @param {string} title - The primary text.
	 * @param {import("react").ReactNode} description - The detailed message.
	 * @param {number} [duration] - Expiry delay in ms.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Error trigger
	 * ```typescript
	 * showError("Error", "Failed to connect to solver");
	 * ```
	 */
	const showError = React.useCallback(
		(title: string, description: ReactNode, duration?: number) => {
			showToast({ description, duration, title, variant: "error" });
		},
		[showToast]
	);

	/**
	 * Triggers an informational notification.
	 *
	 * @param {string} title - The primary text.
	 * @param {import("react").ReactNode} description - The detailed message.
	 * @param {number} [duration] - Expiry delay in ms.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Info trigger
	 * ```typescript
	 * showInfo("Info", "Connecting...");
	 * ```
	 */
	const showInfo = React.useCallback(
		(title: string, description: ReactNode, duration?: number) => {
			showToast({ description, duration, title });
		},
		[showToast]
	);

	/**
	 * Hides the current toast and clears its configuration after an animation delay.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Immediate closure
	 * ```typescript
	 * closeToast();
	 * ```
	 */
	const closeToast = React.useCallback(() => {
		setIsOpen(false);
		// Optionally clear config after a small delay to allow for exit animation
		setTimeout(() => {
			setToastConfig(null);
		}, 500);
	}, []);

	// Dismiss toast on any click/touch outside or inside
	React.useEffect(() => {
		if (!isOpen) return;

		const handleGlobalDismiss = () => {
			closeToast();
		};

		// Small delay to prevent the click that opens the toast from immediately closing it
		const timer = setTimeout(() => {
			window.addEventListener("click", handleGlobalDismiss);
			window.addEventListener("touchstart", handleGlobalDismiss);
		}, 100);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("click", handleGlobalDismiss);
			window.removeEventListener("touchstart", handleGlobalDismiss);
		};
	}, [closeToast, isOpen]);

	const value = React.useMemo<ToastContextType>(
		() => ({
			closeToast,
			isOpen,
			showError,
			showInfo,
			showSuccess,
			showToast,
			toastConfig,
		}),
		[closeToast, isOpen, showError, showInfo, showSuccess, showToast, toastConfig]
	);

	return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};
