import React, { forwardRef, useCallback, useTransition } from "react";
import {
	CounterClockwiseClockIcon,
	EyeOpenIcon,
	PieChartIcon,
	Share1Icon,
} from "@radix-ui/react-icons";
import * as Toolbar from "@radix-ui/react-toolbar";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { DownloadIcon } from "@/components/Icons/DownloadIcon";
import { UploadIcon } from "@/components/Icons/UploadIcon";
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import { useDialog } from "@/context/dialog-utils";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useUrlSync } from "@/hooks/useUrlSync/useUrlSync";
import { useA11yStore } from "@/store/A11yStore";
import { useGridStore } from "@/store/GridStore";

type MobileToolbarProps = {
	isVisible: boolean;
	solving: boolean;
	hasModulesInGrid: boolean;
	onLoadBuild: () => void;
	onSaveBuild: () => void;
	onShowChangelog: () => void;
};

export const MobileToolbar = forwardRef<HTMLDivElement, MobileToolbarProps>(
	({ isVisible, solving, hasModulesInGrid, onLoadBuild, onSaveBuild, onShowChangelog }, ref) => {
		const { t } = useTranslation();
		const { openDialog } = useDialog();
		const { sendEvent } = useAnalytics();
		const { a11yMode, toggleA11yMode } = useA11yStore();
		const { updateUrlForShare } = useUrlSync();
		const isSharedGrid = useGridStore((state) => state.isSharedGrid);
		const [isSharePending, startShareTransition] = useTransition();

		const handleShareClick = useCallback(() => {
			startShareTransition(() => {
				const shareUrl = updateUrlForShare();
				openDialog(null, { shareUrl });
			});
			sendEvent({ category: "ui", action: "share_link", value: 1 });
		}, [updateUrlForShare, openDialog, sendEvent]);

		return (
			<Toolbar.Root
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
				<Toolbar.ToggleGroup
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
						<UploadIcon weight="light" size={20} />
					</IconButton>
					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.saveBuild") ?? ""}
						onClick={onSaveBuild}
						disabled={solving || !hasModulesInGrid || isSharedGrid}
					>
						<DownloadIcon weight="light" size={20} />
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
				</Toolbar.ToggleGroup>

				<Toolbar.ToggleGroup
					type="multiple"
					className="flex items-center gap-2"
					aria-label={t("buttons.utilities") ?? ""}
				>
					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.changelog") ?? ""}
						onClick={() => {
							sendEvent({
								category: "ui",
								action: "show_changelog",
								value: 1,
							});
							onShowChangelog();
						}}
					>
						<CounterClockwiseClockIcon className="h-4 w-4" />
					</IconButton>

					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.userStats") ?? ""}
						onClick={() => {
							sendEvent({
								category: "ui",
								action: "show_user_stats",
								value: 1,
							});
							openDialog("userstats");
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
				</Toolbar.ToggleGroup>
			</Toolbar.Root>
		);
	}
);

MobileToolbar.displayName = "MobileToolbar";
