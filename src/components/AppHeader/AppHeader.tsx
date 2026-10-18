import "./AppHeader.scss";

import React from "react";
import {
	CounterClockwiseClockIcon,
	EyeOpenIcon,
	PieChartIcon,
	RocketIcon,
} from "@radix-ui/react-icons";
import { Flex, Heading, IconButton, Popover, Separator, Switch } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import nmslogo from "@/assets/img/nms-icon.svg";
import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import { LanguageSelector } from "@/components/LanguageSelector/LanguageSelector";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useGridStore } from "@/store/grid/gridStore";
import { useA11yStore } from "@/store/ui/uiStore";
import { useDialog } from "@/utils/system/dialogUtils";

const EasterEggCoordinates = React.lazy(() => import("./EasterEggCoordinates"));

/**
 * Props for the {@link AppHeader} component.
 */
export interface AppHeaderProps {
	/**
	 * Optional override callback when the Changelog button is clicked.
	 *
	 * @default () => openDialog("changelog")
	 */
	onShowChangelog?: () => void;
}

/**
 * Global application header component.
 *
 * @remarks
 * Self-contained header module that renders the application branding, Easter egg popover,
 * accessibility toggle, language selector, and Routed Dialog triggers (`changelog`, `userstats`, `performance`),
 * automatically hiding non-applicable controls when viewing a Shared Grid or on small viewports.
 *
 * @param props - Optional component properties.
 *
 * @returns The rendered banner header element.
 *
 * @see {@link useDialog}
 * @see {@link ./AppHeader.test.tsx Unit Tests}
 * @see {@link ./AppHeader.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <AppHeader />
 * // renders <header class="app-header" role="banner">...</header>
 * ```
 */
const AppHeader: React.FC<AppHeaderProps> = ({ onShowChangelog }) => {
	const { i18n, t } = useTranslation();
	const { openDialog } = useDialog();
	const { sendDeferredEvent } = useAnalytics();
	const isLg = useBreakpoint("1024px");
	const isSm = useBreakpoint("640px");
	const { a11yMode, toggleA11yMode } = useA11yStore();
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const isDockerBuild = import.meta.env.VITE_DOCKER === "true";

	const handleShowChangelog = onShowChangelog ?? (() => openDialog("changelog"));

	const accessibilityToggle = (
		<ConditionalTooltip label={t("buttons.accessibility") ?? ""}>
			<Flex
				align="center"
				gap={{ initial: "2", md: "1" }}
			>
				<EyeOpenIcon
					aria-hidden="true"
					style={{ color: "var(--accent-a11)" }}
				/>
				<Switch
					aria-label={t("buttons.accessibility") ?? ""}
					checked={a11yMode}
					onCheckedChange={toggleA11yMode}
					variant="soft"
				/>
			</Flex>
		</ConditionalTooltip>
	);

	return (
		<header
			className="app-header"
			key={i18n.language}
			role="banner"
		>
			{!isSharedGrid && !isLg && isSm && (
				<Flex
					className="app-header__controls app-header__controls--left"
					gap="2"
				>
					{accessibilityToggle}
				</Flex>
			)}

			{!isSharedGrid && isSm && (
				<Flex
					className="app-header__controls app-header__controls--right"
					gap="2"
				>
					<ConditionalTooltip label={t("buttons.changelog") ?? ""}>
						<IconButton
							aria-label={t("buttons.changelog") ?? ""}
							onClick={handleShowChangelog}
							onMouseEnter={() => {
								void import("@/components/AppDialog/Markdown/MarkdownContentRenderer");
							}}
							variant="soft"
						>
							<CounterClockwiseClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</IconButton>
					</ConditionalTooltip>

					{!isDockerBuild && (
						<ConditionalTooltip label={t("buttons.userStats") ?? ""}>
							<IconButton
								aria-label={t("buttons.userStats") ?? ""}
								onClick={() => openDialog("userstats")}
								onMouseEnter={() => {
									void import("@/components/AppDialog/UserStats/UserStatsDialog");
								}}
								variant="soft"
							>
								<PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							</IconButton>
						</ConditionalTooltip>
					)}

					{!isDockerBuild && isLg && (
						<ConditionalTooltip label="I'm a nerd!">
							<IconButton
								aria-label="Performance Metrics"
								onClick={() => openDialog("performance")}
								onMouseEnter={() => {
									void import("@/components/AppDialog/Performance/performanceChart");
								}}
								variant="soft"
							>
								<RocketIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							</IconButton>
						</ConditionalTooltip>
					)}

					{isLg && accessibilityToggle}
					<LanguageSelector />
				</Flex>
			)}

			<div
				aria-label="No Man's Sky Logo"
				className="app-header__logo-text"
				role="img"
			>
				NO MAN'S SKY
			</div>

			<Flex
				align="center"
				className="app-header__separator-container"
				gap="2"
				my="1"
				width="100%"
			>
				<Separator
					className="flex-1"
					decorative
					orientation="horizontal"
					size="1"
				/>

				<Popover.Root>
					<Popover.Trigger>
						<button
							aria-label={t("buttons.showEasterEgg") ?? ""}
							className="app-header__logo-button"
							onClick={() => {
								sendDeferredEvent({
									action: "earn_virtual_currency",
									category: "ui",
									nonInteraction: false,
									value: 1,
									virtual_currency_name: "easter_egg",
								});
							}}
							type="button"
						>
							<img
								alt=""
								className="app-header__logo-image pt-[3px]"
								height="16"
								src={nmslogo}
								width="10"
							/>
						</button>
					</Popover.Trigger>
					<Popover.Content size="1">
						<React.Suspense fallback={null}>
							<EasterEggCoordinates />
						</React.Suspense>
					</Popover.Content>
				</Popover.Root>

				<Separator
					className="flex-1"
					decorative
					orientation="horizontal"
					size="1"
				/>
			</Flex>

			<Heading
				align="center"
				as="h1"
				className="app-header__title"
				mt="1"
				size={isSm ? "3" : "2"}
				wrap="pretty"
			>
				<Trans
					components={{
						1: <span style={{ color: "var(--accent-11)" }} />,
					}}
					i18nKey="appHeader.subTitle"
				/>
				<span
					className="font-medium"
					style={{ color: "var(--gray-11)" }}
				>
					{" "}
					{__APP_VERSION__}
				</span>
			</Heading>
		</header>
	);
};

export default AppHeader;
