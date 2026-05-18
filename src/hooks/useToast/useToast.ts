import { use } from "react";

import { ToastContext } from "@/context/CreateToastContext";

export { ToastProvider } from "@/context/ToastContext";

/**
 * Custom hook for accessing the application's toast notification system.
 *
 * @remarks
 * This hook provides a high-level API for triggering Radix-based toast
 * notifications (success, error, etc.) from anywhere in the component tree.
 *
 * It is a wrapper around the `ToastContext`.
 *
 * @returns {import('@/context/CreateToastContext').ToastContextType} The toast context containing notification handlers.
 *
 * @throws {Error} If called outside of a {@link import('@/context/ToastContext').ToastProvider}.
 *
 * @see {@link ToastContext} for the underlying context definition.
 * @see {@link import('@/context/ToastContext').ToastProvider} for the required provider component.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Hook usage in a component
 * ```tsx
 * const MyComponent = () => {
 *   const { showSuccess, showError } = useToast();
 *
 *   const handleAction = async () => {
 *     try {
 *       await performTask();
 *       showSuccess("Saved", "Build updated successfully.");
 *     } catch (err) {
 *       showError("Error", "Failed to save build.");
 *     }
 *   };
 *
 *   return <button onClick={handleAction}>Save</button>;
 * };
 * ```
 */
export const useToast = () => {
	const context = use(ToastContext);

	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}

	return context;
};
