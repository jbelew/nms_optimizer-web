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
 * @returns {JSX.Element} The provider element wrapping children.
 *
 * @see {@link ../hooks/useToast/useToast.ts useToast Hook}
 * @see {@link ToastContext}
 * @see {@link ToastConfig}
 * @component
 * @category Components
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * // mounts ToastProvider and its context
 * ```
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	/**
	 * Activates a new toast notification.
	 *
	 * @param {ToastConfig} config - The settings for the toast.
	 * @returns {void} Side-effects only.
	 * @example
	 * ```typescript
	 * showToast({ title: "Updated", description: "Config saved", variant: "success" });
	 * // returns void, side-effect: updates toastConfig and opens toast
	 * ```
	 */
	const showToast = (config: ToastConfig) => {
		setToastConfig({
			...config,
			id: config.id || Date.now().toString(),
		});
		setIsOpen(true);
	};

	/**
	 * Triggers a success notification.
	 *
	 * @param {string} title - The primary text.
	 * @param {import("react").ReactNode} description - The detailed message.
	 * @param {number} [duration] - Expiry delay in ms.
	 * @returns {void} Side-effects only.
	 * @example
	 * ```typescript
	 * showSuccess("Success", "Build applied successfully");
	 * // returns void, side-effect: triggers success toast
	 * ```
	 */
	const showSuccess = (title: string, description: ReactNode, duration?: number) => {
		showToast({ title, description, variant: "success", duration });
	};

	/**
	 * Triggers an error notification.
	 *
	 * @param {string} title - The primary text.
	 * @param {import("react").ReactNode} description - The detailed message.
	 * @param {number} [duration] - Expiry delay in ms.
	 * @returns {void} Side-effects only.
	 * @example
	 * ```typescript
	 * showError("Error", "Failed to connect to solver");
	 * // returns void, side-effect: triggers error toast
	 * ```
	 */
	const showError = (title: string, description: ReactNode, duration?: number) => {
		showToast({ title, description, variant: "error", duration });
	};

	/**
	 * Triggers an informational notification.
	 *
	 * @param {string} title - The primary text.
	 * @param {import("react").ReactNode} description - The detailed message.
	 * @param {number} [duration] - Expiry delay in ms.
	 * @returns {void} Side-effects only.
	 * @example
	 * ```typescript
	 * showInfo("Info", "Connecting...");
	 * // returns void, side-effect: triggers info toast
	 * ```
	 */
	const showInfo = (title: string, description: ReactNode, duration?: number) => {
		showToast({ title, description, duration });
	};

	/**
	 * Hides the current toast and clears its configuration after an animation delay.
	 *
	 * @returns {void} Side-effects only.
	 * @example
	 * ```typescript
	 * closeToast();
	 * // returns void, side-effect: closes active toast
	 * ```
	 */
	const closeToast = () => {
		setIsOpen(false);
		// Optionally clear config after a small delay to allow for exit animation
		setTimeout(() => {
			setToastConfig(null);
		}, 500);
	};

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
	}, [isOpen]);

	const value: ToastContextType = {
		toastConfig,
		isOpen,
		showToast,
		showSuccess,
		showError,
		showInfo,
		closeToast,
	};

	return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};
