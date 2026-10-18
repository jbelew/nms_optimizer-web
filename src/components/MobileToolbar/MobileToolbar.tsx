/**
 * Mobile-optimized navigation and management toolbar module.
 *
 * @remarks
 * This module provides the `MobileToolbar` component, a responsive,
 * scroll-aware interface for accessing critical application features on
 * small-screen devices.
 *
 * @see {@link MobileToolbar}
 * @see {@link ./MobileToolbar.stories.tsx Storybook}
 *
 * @category Components
 */

import React, { useEffect, useTransition } from "react";
import {
	CounterClockwiseClockIcon,
	DownloadIcon,
	EyeOpenIcon,
	FileIcon,
	PieChartIcon,
	Share1Icon,
} from "@radix-ui/react-icons";
import { Root as ToolbarRoot, ToggleGroup as ToolbarToggleGroup } from "@radix-ui/react-toolbar";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { LanguageSelector } from "@/components/LanguageSelector/LanguageSelector";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBuildFileManager } from "@/hooks/useBuildFileManager/useBuildFileManager";
import { registerToolbarForceShow } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import { useScrollHide } from "@/hooks/useScrollHide/useScrollHide";
import { useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useA11yStore, useOptimizeStore } from "@/store/ui/uiStore";
import { useDialog } from "@/utils/system/dialogUtils";

/**
 * A responsive toolbar designed for mobile devices.
 *
 * @remarks
 * This component provides quick access to core build management features (Save, Load, Share)
 * and utility functions (Language, Accessibility, Stats) in a compact, top-pinned layout.
 * It owns its scroll-hide lifecycle via {@link useScrollHide} and registers `forceShow` with
 * {@link registerToolbarForceShow} so programmatic grid scrolling reveals the toolbar.
 *
 * @returns {JSX.Element} The rendered mobile toolbar.
 *
 * @see {@link LanguageSelector}
 * @see {@link useA11yStore}
 * @see {@link useGridStore}
 * @see {@link useBuildFileManager}
 * @see {@link ./MobileToolbar.test.tsx Unit Tests}
 * @see {@link ./MobileToolbar.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MobileToolbar />
 * // renders animated top toolbar on mobile viewports
 * ```
 */
export const MobileToolbar: React.FC = () => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { sendDeferredEvent } = useAnalytics();
	const { a11yMode, toggleA11yMode } = useA11yStore();
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const hasModulesInGrid = useGridStore((state) => state.hasModulesInGrid);
	const solving = useOptimizeStore((state) => state.status.type === "solving");
	const { forceShow, isVisible, toolbarRef } = useScrollHide(80);
	const { handleLoadBuild, handleSaveBuild, isLoadPending, isSavePending } =
		useBuildFileManager();
	const [isSharePending, startShareTransition] = useTransition();

	useEffect(() => {
		registerToolbarForceShow(forceShow);
	}, [forceShow]);

	/**
	 * Generates a share link and opens the share dialog.
	 *
	 * @returns {void}
	 */
	const handleShareClick = () => {
		startShareTransition(() => {
			const shareUrl = sessionCoordinator.getShareUrl();
			openDialog(null, { shareUrl });
		});
		sendDeferredEvent({
			action: "share_link",
			category: "ui",
			nonInteraction: false,
			value: 1,
		});
	};

	return (
		<ToolbarRoot
			className="fixed top-0 right-0 left-0 z-50 -mb-px flex items-center justify-between gap-2 border-b border-b-[var(--accent-3)] py-2 transition-transform duration-300 ease-in-out"
			ref={toolbarRef as React.Ref<HTMLDivElement>}
			style={{
				backgroundColor: "var(--accent-4)",
				paddingLeft: "var(--app-safe-pl)",
				paddingRight: "var(--app-safe-pr)",
				transform: isVisible ? "translateY(0)" : "translateY(calc(-100% - 8px))",
				WebkitUserSelect: "none",
			}}
		>
			<ToolbarToggleGroup
				aria-label={t("buttons.buildManagement") ?? ""}
				className="flex items-center gap-2"
				type="multiple"
			>
				{/* Load/Save/Share buttons for mobile - far left */}
				<IconButton
					aria-label={t("buttons.loadBuild") ?? ""}
					disabled={solving || isLoadPending || isSharedGrid}
					onClick={handleLoadBuild}
					size="2"
					variant="soft"
				>
					<FileIcon />
				</IconButton>
				<IconButton
					aria-label={t("buttons.saveBuild") ?? ""}
					disabled={solving || !hasModulesInGrid || isSavePending || isSharedGrid}
					onClick={handleSaveBuild}
					size="2"
					variant="soft"
				>
					<DownloadIcon />
				</IconButton>
				<IconButton
					aria-label={t("buttons.share") ?? ""}
					disabled={solving || !hasModulesInGrid || isSharePending || isSharedGrid}
					onClick={handleShareClick}
					size="2"
					variant="soft"
				>
					<Share1Icon className="h-4 w-4" />
				</IconButton>
			</ToolbarToggleGroup>

			<ToolbarToggleGroup
				aria-label={t("buttons.utilities") ?? ""}
				className="flex items-center gap-2"
				type="multiple"
			>
				<IconButton
					aria-label={t("buttons.changelog") ?? ""}
					onClick={() => {
						openDialog("changelog");
						sendDeferredEvent({
							action: "show_changelog",
							category: "ui",
							nonInteraction: false,
							value: 1,
						});
					}}
					size="2"
					variant="soft"
				>
					<CounterClockwiseClockIcon className="h-4 w-4" />
				</IconButton>

				<IconButton
					aria-label={t("buttons.userStats") ?? ""}
					onClick={() => {
						openDialog("userstats");
						sendDeferredEvent({
							action: "show_user_stats",
							category: "ui",
							nonInteraction: false,
							value: 1,
						});
					}}
					size="2"
					variant="soft"
				>
					<PieChartIcon className="h-4 w-4" />
				</IconButton>

				{/* A11y mode switch */}
				<IconButton
					aria-label={t("buttons.accessibility") ?? ""}
					onClick={toggleA11yMode}
					size="2"
					variant={a11yMode ? "solid" : "surface"}
				>
					<EyeOpenIcon className="h-4 w-4" />
				</IconButton>

				<LanguageSelector />
			</ToolbarToggleGroup>
		</ToolbarRoot>
	);
};

MobileToolbar.displayName = "MobileToolbar";
