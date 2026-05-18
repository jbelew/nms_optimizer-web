import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useA11yStore } from "@/store/app/a11yStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useDialog } from "@/utils/system/dialogUtils";

import { AppHeaderContext } from "./useAppHeaderContext";

/**
 * Provider for the AppHeader component.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - Child elements.
 * @param {() => void} props.onShowChangelog - Callback for changelog.
 *
 * @returns {JSX.Element} The context provider.
 */
export const AppHeaderProvider: React.FC<{
	children: React.ReactNode;
	onShowChangelog: () => void;
}> = ({ children, onShowChangelog }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { sendDeferredEvent } = useAnalytics();
	const isLg = useBreakpoint("1024px");
	const isSm = useBreakpoint("640px");
	const { a11yMode, toggleA11yMode } = useA11yStore();
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const isDockerBuild = import.meta.env.VITE_DOCKER === "true";

	const value = useMemo(
		() => ({
			a11yMode,
			isDockerBuild,
			isLg,
			isSharedGrid,
			isSm,
			onShowChangelog,
			openDialog,
			sendDeferredEvent,
			t,
			toggleA11yMode,
		}),
		[
			a11yMode,
			isDockerBuild,
			isLg,
			isSharedGrid,
			isSm,
			onShowChangelog,
			openDialog,
			sendDeferredEvent,
			t,
			toggleA11yMode,
		]
	);

	return <AppHeaderContext.Provider value={value}>{children}</AppHeaderContext.Provider>;
};
