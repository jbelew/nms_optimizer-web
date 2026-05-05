// src/components/AppHeader/AppHeader.tsx
import "./AppHeader.scss";

import React, { useEffect } from "react";
import {
	CounterClockwiseClockIcon,
	EyeOpenIcon,
	PieChartIcon,
	RocketIcon,
} from "@radix-ui/react-icons";
import { Box, Flex, Heading, IconButton, Popover, Separator, Switch } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import nmslogo from "@/assets/img/nms-icon.svg";
import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useA11yStore } from "@/store/app/a11yStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useDialog } from "@/utils/system/dialogUtils";

const EasterEggCoordinates = React.lazy(() => import("./EasterEggCoordinates"));

/**
 * Props for the `AppHeader` component.
 */
interface AppHeaderProps {
	/** Callback function to trigger the changelog dialog. **Must be provided.** */
	onShowChangelog: () => void;
}

/**
 * The global application header component.
 *
 * @remarks
 * It renders the primary logo, application title, version number, and a suite
 * of global controls including language selection, accessibility toggles, and
 * links to statistics and changelogs. It also features a hidden "Easter Egg"
 * popover with in-game coordinates.
 *
 * @param {AppHeaderProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered application header.
 *
 * @see {@link LanguageSelector}
 * @see {@link ConditionalTooltip}
 * @see {@link useDialog}
 * @see {@link ./AppHeader.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <AppHeader onShowChangelog={() => setChangelogOpen(true)} />
 * ```
 */
const AppHeader: React.FC<AppHeaderProps> = ({ onShowChangelog }) => {
	const { t, i18n } = useTranslation();
	const { openDialog } = useDialog();
	const { sendDeferredEvent } = useAnalytics();
	const isLg = useBreakpoint("1024px");
	const isSm = useBreakpoint("640px");
	const { a11yMode, toggleA11yMode } = useA11yStore();
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);

	useEffect(() => {
		if (a11yMode) {
			document.body.classList.add("a11y-font");
		} else {
			document.body.classList.remove("a11y-font");
		}
	}, [a11yMode]);

	return (
		<Box key={i18n.language} className="app-header">
			{!isSharedGrid && !isLg && isSm && (
				<Flex gap="2" className="app-header__controls app-header__controls--left">
					<ConditionalTooltip label={t("buttons.accessibility") ?? ""}>
						<Flex align="center" gap="2">
							<EyeOpenIcon
								aria-hidden="true"
								style={{ color: "var(--accent-a11)" }}
							/>
							<Switch
								variant="soft"
								checked={a11yMode}
								onCheckedChange={toggleA11yMode}
								aria-label={t("buttons.accessibility") ?? ""}
							/>
						</Flex>
					</ConditionalTooltip>
				</Flex>
			)}

			{!isSharedGrid && isSm && (
				<Flex gap="2" className="app-header__controls app-header__controls--right">
					<ConditionalTooltip label={t("buttons.changelog") ?? ""}>
						<IconButton
							variant="soft"
							aria-label={t("buttons.changelog") ?? ""}
							onMouseEnter={() => {
								// Prefetch the component when user hovers
								void import("../AppDialog/Markdown/MarkdownContentRenderer");
							}}
							onClick={() => {
								onShowChangelog();
							}}
						>
							<CounterClockwiseClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</IconButton>
					</ConditionalTooltip>

					<ConditionalTooltip label={t("buttons.userStats") ?? ""}>
						<IconButton
							variant="soft"
							aria-label={t("buttons.userStats") ?? ""}
							onMouseEnter={() => {
								void import("../../routes/UserStatsRoute");
							}}
							onClick={() => {
								openDialog("userstats");
							}}
						>
							<PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</IconButton>
					</ConditionalTooltip>
					{isLg && (
						<ConditionalTooltip label="I'm a nerd!">
							<IconButton
								variant="soft"
								aria-label="Performance Metrics"
								onMouseEnter={() => {
									// Prefetch performance chart logic
									void import("../AppDialog/Performance/PerformanceChart");
								}}
								onClick={() => {
									openDialog("performance");
								}}
							>
								<RocketIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							</IconButton>
						</ConditionalTooltip>
					)}

					{isLg && (
						<ConditionalTooltip label={t("buttons.accessibility") ?? ""}>
							<Flex align="center" gap="1">
								<EyeOpenIcon
									aria-hidden="true"
									style={{ color: "var(--accent-a11)" }}
								/>
								<Switch
									variant="soft"
									checked={a11yMode}
									onCheckedChange={toggleA11yMode}
									aria-label={t("buttons.accessibility") ?? ""}
								/>
							</Flex>
						</ConditionalTooltip>
					)}

					<LanguageSelector />
				</Flex>
			)}

			<div className="app-header__logo-text">NO MAN'S SKY</div>

			<Flex
				align="center"
				gap="2"
				my="1"
				width="100%"
				className="app-header__separator-container"
			>
				<Separator size="1" orientation="horizontal" decorative className="flex-1" />

				<Popover.Root>
					<Popover.Trigger>
						<button
							type="button"
							className="app-header__logo-button"
							aria-label={t("buttons.showEasterEgg") ?? ""}
							onClick={() => {
								sendDeferredEvent({
									category: "ui",
									action: "earn_virtual_currency",
									virtual_currency_name: "easter_egg",
									value: 1,
									nonInteraction: false,
								});
							}}
						>
							<img
								className="app-header__logo-image pt-[3px]"
								src={nmslogo}
								alt=""
								width="10"
								height="16"
							/>
						</button>
					</Popover.Trigger>
					<Popover.Content size="1">
						<React.Suspense fallback={null}>
							<EasterEggCoordinates />
						</React.Suspense>
					</Popover.Content>
				</Popover.Root>

				<Separator size="1" orientation="horizontal" decorative className="flex-1" />
			</Flex>

			<Heading
				wrap="pretty"
				align="center"
				as="h2"
				mt="1"
				size={isSm ? "3" : "2"}
				className="app-header__title"
			>
				<Trans
					i18nKey="appHeader.subTitle"
					components={{
						1: <span className="font-mono" style={{ color: "var(--accent-11)" }} />,
					}}
				/>
				<span className="font-medium" style={{ color: "var(--gray-11)" }}>
					{" "}
					{__APP_VERSION__}
				</span>
			</Heading>
		</Box>
	);
};

export default AppHeader;
