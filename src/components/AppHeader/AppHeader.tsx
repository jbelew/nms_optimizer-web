// src/components/AppHeader/AppHeader.tsx
import "./AppHeader.scss";

import React, { useEffect } from "react";
import { CounterClockwiseClockIcon, EyeOpenIcon, PieChartIcon } from "@radix-ui/react-icons";
import {
	Box,
	Code,
	DataList,
	Flex,
	Heading,
	IconButton,
	Popover,
	Separator,
	Switch,
} from "@radix-ui/themes";
import { Header } from "@radix-ui/themes/components/table";
import { Trans, useTranslation } from "react-i18next";

import nmslogo from "@/assets/img/nms-icon.webp";
import { ConditionalTooltip } from "@/components/ConditionalTooltip";
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import { useDialog } from "@/context/dialog-utils";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useA11yStore } from "@/store/A11yStore";
import { useGridStore } from "@/store/GridStore";

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
		<Box p="5" key={i18n.language} className="app-header">
			{!isSharedGrid && !isLg && isSm && (
				<Flex gap="2" className="app-header__controls app-header__controls--left">
					<ConditionalTooltip label={t("buttons.accessibility") ?? ""}>
						<Flex align="center" gap="2">
							<EyeOpenIcon style={{ color: "var(--accent-a11)" }} />
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

			{!isSharedGrid && (
				<Flex gap="2" className="app-header__controls app-header__controls--right">
					<ConditionalTooltip label={t("buttons.changelog") ?? ""}>
						<IconButton
							variant="soft"
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
							<CounterClockwiseClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</IconButton>
					</ConditionalTooltip>

					<ConditionalTooltip label={t("buttons.userStats") ?? ""}>
						<IconButton
							variant="soft"
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
							<PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</IconButton>
					</ConditionalTooltip>

					<LanguageSelector />

					{isLg && (
						<ConditionalTooltip label={t("buttons.accessibility") ?? ""}>
							<Flex align="center" gap="2">
								<EyeOpenIcon style={{ color: "var(--accent-a11)" }} />
								<Switch
									variant="soft"
									checked={a11yMode}
									onCheckedChange={toggleA11yMode}
									aria-label={t("buttons.accessibility") ?? ""}
								/>
							</Flex>
						</ConditionalTooltip>
					)}
				</Flex>
			)}

			<h1 className="app-header__logo-text">NO MAN&apos;S SKY</h1>

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
						<img
							className="app-header__logo-image"
							src={nmslogo}
							alt="No Man's Sky Atlas Logo"
							width="16"
							height="20"
							onClick={() => {
								sendEvent({
									category: "ui",
									action: "found_secret",
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
					v{__APP_VERSION__}
				</span>
			</Heading>
		</Box>
	);
};

export default AppHeader;
