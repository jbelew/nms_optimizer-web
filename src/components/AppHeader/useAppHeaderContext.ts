import type { GA4Event } from "@/utils/analytics/tracking";
import type { DialogType } from "@/utils/system/dialogUtils";
import { createContext, use } from "react";

/**
 * Interface for the AppHeader context value.
 *
 * @category Components
 */
export interface AppHeaderContextValue {
	/** Current accessibility mode status. */
	a11yMode: boolean;
	/** True if running in Docker build mode. */
	isDockerBuild: boolean;
	/** True if large screen breakpoint. */
	isLg: boolean;
	/** True if viewing a shared grid. */
	isSharedGrid: boolean;
	/** True if small screen breakpoint. */
	isSm: boolean;
	/** Callback to show the changelog. */
	onShowChangelog: () => void;
	/** Opens a routed dialog. */
	openDialog: (id: NonNullable<DialogType> | null) => void;
	/** Dispatches a deferred analytics event. */
	sendDeferredEvent: (event: GA4Event) => void;
	/** Translation function. */
	t: (key: string) => string;
	/** Toggles accessibility mode. */
	toggleA11yMode: () => void;
}

export const AppHeaderContext = createContext<AppHeaderContextValue | null>(null);

/**
 * Hook to access the AppHeader context.
 *
 * @returns {AppHeaderContextValue} The header context value.
 *
 * @throws {Error} If used outside of AppHeaderProvider.
 */
export const useAppHeaderContext = () => {
	const context = use(AppHeaderContext);

	if (!context) {
		throw new Error("useAppHeaderContext must be used within AppHeaderProvider");
	}

	return context;
};
