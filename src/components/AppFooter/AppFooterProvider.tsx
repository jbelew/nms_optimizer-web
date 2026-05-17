import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useDialog } from "@/utils/system/dialogUtils";

import { AppFooterContext } from "./useAppFooterContext";

/**
 * Provider for the AppFooter component.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - Child elements.
 * @param {string} [props.buildDate] - Build date string.
 * @param {string} props.buildVersion - Build version string.
 *
 * @returns {JSX.Element} The context provider.
 */
export const AppFooterProvider: React.FC<{
	buildDate?: string;
	buildVersion: string;
	children: React.ReactNode;
}> = ({ buildDate, buildVersion, children }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();

	const value = useMemo(
		() => ({
			buildDate,
			buildVersion,
			openDialog,
			t,
		}),
		[buildDate, buildVersion, openDialog, t]
	);

	return <AppFooterContext.Provider value={value}>{children}</AppFooterContext.Provider>;
};
