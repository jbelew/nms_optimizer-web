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

import React, { forwardRef, useTransition } from "react";
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

import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
// import { useScreenshot } from "@/hooks/useScreenshot/useScreenshot";
import { useUrlSync } from "@/hooks/useUrlSync/useUrlSync";
import { useA11yStore } from "@/store/app/a11yStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useDialog } from "@/utils/system/dialogUtils";

/**
 * Props for the `MobileToolbar` component.
 */
type MobileToolbarProps = {
	/** Whether the toolbar is currently visible on the screen. */
	isVisible: boolean;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
	/** Whether any technology modules are currently placed in the grid. */
	hasModulesInGrid: boolean;
	/** Callback to trigger the build loading workflow. */
	onLoadBuild: () => void;
	/** Callback to trigger the build saving workflow. */
	onSaveBuild: () => void;
	/** Callback to display the application changelog. */
	onShowChangelog: () => void;
	/** Ref to the grid DOM element, used for screenshot capture. */
	gridRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * A responsive toolbar designed for mobile devices.
 *
 * @remarks
 * This component provides quick access to core build management features (Save, Load, Share)
 * and utility functions (Language, Accessibility, Stats) in a compact, top-pinned layout.
 * It animates its position based on the `isVisible` prop, typically controlled by
 * the user's scroll direction.
 *
 * @param {MobileToolbarProps} props - Component properties.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the root toolbar container.
 *
 * @returns {JSX.Element} The rendered mobile toolbar.
 *
 * @see {@link LanguageSelector}
 * @see {@link useA11yStore}
 * @see {@link useGridStore}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MobileToolbar isVisible={true} solving={false} onLoadBuild={onLoad} onSaveBuild={onSave} onShowChangelog={onChangelog} hasModulesInGrid={true} />
 * // renders animated top toolbar
 * ```
 */
export const MobileToolbar = forwardRef<HTMLDivElement, MobileToolbarProps>(
	(
		{
			isVisible,
			solving,
			hasModulesInGrid,
			onLoadBuild,
			onSaveBuild,
			onShowChangelog,
			// gridRef,
		},
		ref
	) => {
		const { t } = useTranslation();
		const { openDialog } = useDialog();
		const { sendDeferredEvent } = useAnalytics();
		const { a11yMode, toggleA11yMode } = useA11yStore();
		const { updateUrlForShare } = useUrlSync();
		const isSharedGrid = useGridStore((state) => state.isSharedGrid);
		const [isSharePending, startShareTransition] = useTransition();
		// const { handleScreenshot, isCapturing } = useScreenshot();

		/**
		 * Generates a share link and opens the share dialog.
		 *
		 * @example
		 * handleShareClick();
		 */
		const handleShareClick = () => {
			startShareTransition(() => {
				const shareUrl = updateUrlForShare();
				openDialog(null, { shareUrl });
			});
			sendDeferredEvent({
				category: "ui",
				action: "share_link",
				value: 1,
				nonInteraction: false,
			});
		};

		/**
		 * Captures the grid section as a screenshot.
		 *
		 * @example
		 * handleScreenshotClick();
		 */
		// const handleScreenshotClick = () => {
		// 	if (gridRef.current) {
		// 		handleScreenshot(gridRef.current);
		// 	}
		// };

		return (
			<ToolbarRoot
				ref={ref}
				className="fixed top-0 right-0 left-0 z-50 -mb-px flex items-center justify-between gap-2 py-2 transition-transform duration-300 ease-in-out"
				style={{
					backgroundColor: "var(--accent-4)",
					WebkitUserSelect: "none",
					transform: isVisible ? "translateY(0)" : "translateY(calc(-100% - 8px))",
					paddingLeft: "var(--app-safe-pl)",
					paddingRight: "var(--app-safe-pr)",
				}}
			>
				<ToolbarToggleGroup
					type="multiple"
					className="flex items-center gap-2"
					aria-label={t("buttons.buildManagement") ?? ""}
				>
					{/* Load/Save/Share buttons for mobile - far left */}
					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.loadBuild") ?? ""}
						onClick={onLoadBuild}
						disabled={solving || isSharedGrid}
					>
						<FileIcon />
					</IconButton>
					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.saveBuild") ?? ""}
						onClick={onSaveBuild}
						disabled={solving || !hasModulesInGrid || isSharedGrid}
					>
						<DownloadIcon />
					</IconButton>
					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.share") ?? ""}
						onClick={handleShareClick}
						disabled={solving || !hasModulesInGrid || isSharePending || isSharedGrid}
					>
						<Share1Icon className="h-4 w-4" />
					</IconButton>
					{/* {					<IconButton
						size="2"
						variant="soft"
						className="gridTable__button gridTable__button--screenshot"
						onClick={handleScreenshotClick}
						disabled={solving || !hasModulesInGrid || isCapturing}
						aria-label={t("buttons.screenshot")}
					>
						<CameraIcon />
					</IconButton>} */}
				</ToolbarToggleGroup>

				<ToolbarToggleGroup
					type="multiple"
					className="flex items-center gap-2"
					aria-label={t("buttons.utilities") ?? ""}
				>
					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.changelog") ?? ""}
						onClick={() => {
							onShowChangelog();
							sendDeferredEvent({
								category: "ui",
								action: "show_changelog",
								value: 1,
								nonInteraction: false,
							});
						}}
					>
						<CounterClockwiseClockIcon className="h-4 w-4" />
					</IconButton>

					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.userStats") ?? ""}
						onClick={() => {
							openDialog("userstats");
							sendDeferredEvent({
								category: "ui",
								action: "show_user_stats",
								value: 1,
								nonInteraction: false,
							});
						}}
					>
						<PieChartIcon className="h-4 w-4" />
					</IconButton>

					{/* A11y mode switch */}
					<IconButton
						variant={a11yMode ? "solid" : "surface"}
						size="2"
						onClick={toggleA11yMode}
						aria-label={t("buttons.accessibility") ?? ""}
					>
						<EyeOpenIcon className="h-4 w-4" />
					</IconButton>

					<LanguageSelector />
				</ToolbarToggleGroup>
			</ToolbarRoot>
		);
	}
);

MobileToolbar.displayName = "MobileToolbar";
