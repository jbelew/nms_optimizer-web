import { createContext } from "react";

export interface ToastConfig {
	title: string;
	description: React.ReactNode;
	variant?: "success" | "error";
	duration?: number; // Duration in milliseconds, defaults to 8000
}

export interface ToastContextType {
	toastConfig: ToastConfig | null;
	isOpen: boolean;
	showToast: (config: ToastConfig) => void;
	showSuccess: (title: string, description: React.ReactNode, duration?: number) => void;
	showError: (title: string, description: React.ReactNode, duration?: number) => void;
	showInfo: (title: string, description: React.ReactNode, duration?: number) => void;
	closeToast: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
