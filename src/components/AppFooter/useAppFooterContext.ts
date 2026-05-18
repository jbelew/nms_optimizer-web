import type { DialogType } from "@/utils/system/dialogUtils";
import { createContext, use } from "react";

/**
 * Interface for the AppFooter context value.
 *
 * @category Components
 */
export interface AppFooterContextValue {
	/** The build date string. */
	buildDate?: string;
	/** The build version string. */
	buildVersion: string;
	/** Opens a routed dialog. */
	openDialog: (id: NonNullable<DialogType> | null) => void;
	/** Translation function. */
	t: (key: string) => string;
}

export const AppFooterContext = createContext<AppFooterContextValue | null>(null);

/**
 * Hook to access the AppFooter context.
 *
 * @returns {AppFooterContextValue} The footer context value.
 *
 * @throws {Error} If used outside of AppFooterProvider.
 */
export const useAppFooterContext = () => {
	const context = use(AppFooterContext);

	if (!context) {
		throw new Error("useAppFooterContext must be used within AppFooterProvider");
	}

	return context;
};
