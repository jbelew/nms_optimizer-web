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
import { LanguageSelector } from "@/components/LanguageSelector/LanguageSelector";

import { AppHeaderProvider } from "./AppHeaderProvider";
import { useAppHeaderContext } from "./useAppHeaderContext";

const EasterEggCoordinates = React.lazy(() => import("./EasterEggCoordinates"));

/**
 * Root component for the AppHeader.
 */
const AppHeaderRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { i18n } = useTranslation();
	const { a11yMode } = useAppHeaderContext();

	useEffect(() => {
		if (a11yMode) {
			document.body.classList.add("a11y-font");
		} else {
			document.body.classList.remove("a11y-font");
		}
	}, [a11yMode]);

	return (
		<Box className="app-header" key={i18n.language}>
			{children}
		</Box>
	);
};

/**
 * Accessibility toggle component.
 */
const AppHeaderAccessibilityToggle: React.FC = () => {
	const { a11yMode, t, toggleA11yMode } = useAppHeaderContext();

	return (
		<ConditionalTooltip label={t("buttons.accessibility") ?? ""}>
			<Flex align="center" gap={{ initial: "2", md: "1" }}>
				<EyeOpenIcon aria-hidden="true" style={{ color: "var(--accent-a11)" }} />
				<Switch
					aria-label={t("buttons.accessibility") ?? ""}
					checked={a11yMode}
					onCheckedChange={toggleA11yMode}
					variant="soft"
				/>
			</Flex>
		</ConditionalTooltip>
	);
};

/**
 * Changelog button component.
 */
const AppHeaderChangelogButton: React.FC = () => {
	const { onShowChangelog, t } = useAppHeaderContext();

	return (
		<ConditionalTooltip label={t("buttons.changelog") ?? ""}>
			<IconButton
				aria-label={t("buttons.changelog") ?? ""}
				onClick={onShowChangelog}
				onMouseEnter={() => {
					void import("@/components/AppDialog/Markdown/MarkdownContentRenderer");
				}}
				variant="soft"
			>
				<CounterClockwiseClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
			</IconButton>
		</ConditionalTooltip>
	);
};

/**
 * User Stats button component.
 */
const AppHeaderUserStatsButton: React.FC = () => {
	const { isDockerBuild, openDialog, t } = useAppHeaderContext();
	if (isDockerBuild) return null;

	return (
		<ConditionalTooltip label={t("buttons.userStats") ?? ""}>
			<IconButton
				aria-label={t("buttons.userStats") ?? ""}
				onClick={() => openDialog("userstats")}
				onMouseEnter={() => {
					void import("@/routes/UserStatsRoute");
				}}
				variant="soft"
			>
				<PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
			</IconButton>
		</ConditionalTooltip>
	);
};

/**
 * Performance metrics button component.
 */
const AppHeaderPerformanceButton: React.FC = () => {
	const { isDockerBuild, isLg, openDialog } = useAppHeaderContext();
	if (isDockerBuild || !isLg) return null;

	return (
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
	);
};

/**
 * Logo Text component ("NO MAN'S SKY").
 */
const AppHeaderLogoText: React.FC = () => {
	return <div className="app-header__logo-text">NO MAN'S SKY</div>;
};

/**
 * Logo and Easter Egg component (the separator line).
 */
const AppHeaderLogo: React.FC = () => {
	const { sendDeferredEvent, t } = useAppHeaderContext();

	return (
		<Flex
			align="center"
			className="app-header__separator-container"
			gap="2"
			my="1"
			width="100%"
		>
			<Separator className="flex-1" decorative orientation="horizontal" size="1" />

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

			<Separator className="flex-1" decorative orientation="horizontal" size="1" />
		</Flex>
	);
};

/**
 * Subtitle and version component.
 */
const AppHeaderSubtitle: React.FC = () => {
	const { isSm } = useAppHeaderContext();

	return (
		<Heading
			align="center"
			as="h2"
			className="app-header__title"
			mt="1"
			size={isSm ? "3" : "2"}
			wrap="pretty"
		>
			<Trans
				components={{
					1: <span className="font-mono" style={{ color: "var(--accent-11)" }} />,
				}}
				i18nKey="appHeader.subTitle"
			/>
			<span className="font-medium" style={{ color: "var(--gray-11)" }}>
				{" "}
				{__APP_VERSION__}
			</span>
		</Heading>
	);
};

/**
 * Section for left-side controls.
 */
const AppHeaderLeftControls: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<Flex className="app-header__controls app-header__controls--left" gap="2">
			{children}
		</Flex>
	);
};

/**
 * Section for right-side controls.
 */
const AppHeaderRightControls: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<Flex className="app-header__controls app-header__controls--right" gap="2">
			{children}
		</Flex>
	);
};

/**
 * The global application header component.
 */
const AppHeaderComp: React.FC<{ onShowChangelog: () => void }> = ({ onShowChangelog }) => {
	return (
		<AppHeaderProvider onShowChangelog={onShowChangelog}>
			<AppHeaderContainer />
		</AppHeaderProvider>
	);
};

/**
 * Internal container to consume context and render the default layout.
 */
const AppHeaderContainer: React.FC = () => {
	const { isLg, isSharedGrid, isSm } = useAppHeaderContext();

	return (
		<AppHeaderRoot>
			{!isSharedGrid && !isLg && isSm && (
				<AppHeaderLeftControls>
					<AppHeaderAccessibilityToggle />
				</AppHeaderLeftControls>
			)}

			{!isSharedGrid && isSm && (
				<AppHeaderRightControls>
					<AppHeaderChangelogButton />
					<AppHeaderUserStatsButton />
					<AppHeaderPerformanceButton />
					{isLg && <AppHeaderAccessibilityToggle />}
					<LanguageSelector />
				</AppHeaderRightControls>
			)}

			<AppHeaderLogoText />
			<AppHeaderLogo />
			<AppHeaderSubtitle />
		</AppHeaderRoot>
	);
};

/**
 * Compound component for AppHeader.
 */
const AppHeader = Object.assign(AppHeaderComp, {
	AccessibilityToggle: AppHeaderAccessibilityToggle,
	ChangelogButton: AppHeaderChangelogButton,
	LeftControls: AppHeaderLeftControls,
	Logo: AppHeaderLogo,
	LogoText: AppHeaderLogoText,
	PerformanceButton: AppHeaderPerformanceButton,
	Provider: AppHeaderProvider,
	RightControls: AppHeaderRightControls,
	Root: AppHeaderRoot,
	Subtitle: AppHeaderSubtitle,
	UserStatsButton: AppHeaderUserStatsButton,
});

export default AppHeader;
