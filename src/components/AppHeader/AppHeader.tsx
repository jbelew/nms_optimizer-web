// src/components/AppHeader/AppHeader.tsx
import "./AppHeader.scss";

import React, { useEffect } from "react";
import { CounterClockwiseClockIcon, EyeOpenIcon, PieChartIcon } from "@radix-ui/react-icons";
import { Code, DataList, Heading, IconButton, Popover, Separator } from "@radix-ui/themes";
import { Header } from "@radix-ui/themes/components/table";
import { Trans, useTranslation } from "react-i18next";

import nmslogo from "@/assets/img/nms-icon.webp";
import { ConditionalTooltip } from "@/components/ConditionalTooltip";
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import { useDialog } from "@/context/dialog-utils";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useA11yStore } from "@/store/A11yStore";

/**
 * @interface AppHeaderProps
 * @property {() => void} onShowChangelog - Callback function to be invoked when the changelog button is clicked.
 */
interface AppHeaderProps {
	onShowChangelog: () => void;
}

/**
 * AppHeader component displays the application header.
 * It includes the application title, a language selector, and buttons for user statistics and changelog.
 *
 * @param {AppHeaderProps} props - The props for the AppHeader component.
 * @returns {JSX.Element} The rendered AppHeader component.
 */
const AppHeader: React.FC<AppHeaderProps> = ({ onShowChangelog }) => {
	const { t, i18n } = useTranslation();
	const { openDialog } = useDialog();
	const { sendEvent } = useAnalytics();
	const isLg = useBreakpoint("1024px");
	const { a11yMode, toggleA11yMode } = useA11yStore();

	useEffect(() => {
		if (a11yMode) {
			document.body.classList.add("a11y-font");
		} else {
			document.body.classList.remove("a11y-font");
		}
	}, [a11yMode]);

	return (
		<header
			key={i18n.language}
			className="header relative flex flex-col items-center p-4 pb-2 sm:px-8 sm:pt-6 sm:pb-4 lg:rounded-t-xl"
		>
			<div className="absolute! top-4! left-4! z-10 flex items-start sm:top-5! sm:left-8!">
				{!isLg && (
					<ConditionalTooltip label={t("buttons.accessibility") ?? ""}>
						<IconButton
							size="1"
							variant={a11yMode ? "solid" : "surface"}
							radius="full"
							aria-label={t("buttons.accessibility") ?? ""}
							onClick={toggleA11yMode}
						>
							<EyeOpenIcon />
						</IconButton>
					</ConditionalTooltip>
				)}
			</div>
			<div className="absolute! top-4! right-4! z-10 flex items-center sm:top-5! sm:right-8!">
				<ConditionalTooltip label={t("buttons.userStats") ?? ""}>
					<IconButton
						variant="soft"
						radius="full"
						className="mr-1! sm:mr-2!"
						size={isLg ? "2" : "1"}
						aria-label={t("buttons.userStats") ?? ""}
						onClick={() => {
							sendEvent({
								category: "User Interactions",
								action: "showUserStats",
								value: 1,
							});
							openDialog("userstats");
						}}
					>
						<PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
					</IconButton>
				</ConditionalTooltip>

				<LanguageSelector />

				{isLg && (
					<ConditionalTooltip label={t("buttons.accessibility") ?? ""}>
						<IconButton
							variant={a11yMode ? "solid" : "surface"}
							radius="full"
							aria-label={t("buttons.accessibility") ?? ""}
							onClick={toggleA11yMode}
						>
							<EyeOpenIcon />
						</IconButton>
					</ConditionalTooltip>
				)}
			</div>

			<h1 className="header__logo--text text-2xl [word-spacing:-.25rem] sm:text-4xl">
				NO MAN&apos;S SKY
			</h1>

			<div className="m-1 mb-2 flex w-full items-center gap-2">
				<Separator
					size="1"
					orientation="horizontal"
					color="cyan"
					decorative
					className="flex-1"
				/>

				<Popover.Root>
					<Popover.Trigger>
						<img
							className="h-4 w-3 shrink-0 sm:h-5 sm:w-4"
							style={{ color: "var(--accent-track)" }}
							src={nmslogo}
							alt="No Man's Sky Atlas Logo"
							onClick={() => {
								sendEvent({
									category: "User Interactions",
									action: "foundSecret",
									value: 1,
								});
							}}
						/>
					</Popover.Trigger>
					<Popover.Content size="1">
						<DataList.Root size="1">
							<Header className="nmsFont--header text-base">Ityanianat</Header>
							<DataList.Item align="center">
								<DataList.Label className="nmsFont">Mountain House</DataList.Label>
								<DataList.Value>
									<Code>0CEE:0085:0CCF:040D</Code>
								</DataList.Value>
							</DataList.Item>
							<Header className="nmsFont--header text-base">Odyalutai</Header>
							<DataList.Item align="center">
								<DataList.Label className="nmsFont">
									Faye Sigma Fishing Resort
								</DataList.Label>
								<DataList.Value>
									<Code>07EE:008A:07EF:03E9</Code>
								</DataList.Value>
								<DataList.Label className="nmsFont">Sanctum Zero</DataList.Label>
								<DataList.Value>
									<Code>07E9:0088:07ED:0404</Code>
								</DataList.Value>
							</DataList.Item>
						</DataList.Root>
					</Popover.Content>
				</Popover.Root>

				<Separator
					size="1"
					orientation="horizontal"
					color="cyan"
					decorative
					className="flex-1"
				/>
				{/* Tooltip button absolutely positioned to the right */}
			</div>

			<Heading
				wrap="pretty"
				align="center"
				as="h2"
				size={{ initial: "2", sm: "3" }}
				className="header__title w-fit"
			>
				<Trans
					i18nKey="appHeader.subTitle"
					components={{
						1: <span className="font-mono" style={{ color: "var(--accent-11)" }} />,
					}}
				/>
				<span className="glow font-medium" style={{ color: "var(--gray-11)" }}>
					{" "}
					v{__APP_VERSION__}
				</span>
				<ConditionalTooltip label={t("buttons.changelog") ?? ""}>
					<IconButton
						variant="ghost"
						radius="full"
						size="1"
						className="ml-px!"
						aria-label={t("buttons.changelog") ?? ""}
						onClick={() => {
							sendEvent({
								category: "User Interactions",
								action: "showChangelog",
								value: 1,
							});
							onShowChangelog();
						}}
					>
						<CounterClockwiseClockIcon className="mt-px h-4 w-4 sm:h-5 sm:w-5" />
					</IconButton>
				</ConditionalTooltip>
			</Heading>
		</header>
	);
};

export default AppHeader;
