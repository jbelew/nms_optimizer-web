// src/components/MainAppContent/MainAppContent.tsx
import "./MainAppContent.scss";

import React, { Suspense, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";

import { useErrorDispatcher } from "@/hooks/useErrorDispatcher";
import { useToast } from "@/hooks/useToast/useToast";
import { useGridStore } from "@/store/grid/gridStore";

import { MainAppLayoutContent, ShipTypesLoader } from "./MainAppLayout";

/**
 * The primary layout component for the application's main functional area.
 *
 * @remarks
 * Coordinates workspace-level lifecycle effects (Shared Grid notifications
 * and toast error dispatching), triggers initial data loading via Suspense,
 * and renders the core layout.
 *
 * @returns {JSX.Element} The orchestrated main application content.
 *
 * @see {@link MainAppLayoutContent}
 * @see {@link ./MainAppLayout.test.tsx Unit Tests}
 * @see {@link ./MainAppContent.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MainAppContent />
 * // mounts MainAppContent workspace
 * ```
 */
export const MainAppContent = () => {
	const { t } = useTranslation();
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const { showInfo } = useToast();

	// Show information toast when viewing a read-only shared grid
	useEffect(() => {
		if (isSharedGrid) {
			showInfo(
				t("common.information", "Information"),
				<Trans components={{ strong: <strong /> }} i18nKey="mainApp.viewingSharedBuild" />
			);
		}
	}, [isSharedGrid, showInfo, t]);

	// Monitor session errors and dispatch messages to toast
	useErrorDispatcher();

	return (
		<>
			{/* Load ship types and tech definitions - suspends and allows layout to render once ready */}
			<Suspense fallback={null}>
				<ShipTypesLoader />
			</Suspense>

			{/* Core application layout structure */}
			<MainAppLayoutContent />
		</>
	);
};
