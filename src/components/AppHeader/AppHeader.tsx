// src/components/AppHeader/AppHeader.tsx
import "./AppHeader.css";

import React from "react";
import { CounterClockwiseClockIcon, PieChartIcon } from "@radix-ui/react-icons";
import { Heading, IconButton, Separator, Tooltip } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import RhombusIcon from "../Icons/RhombusIcon";
import LanguageSelector from "../LanguageSelector/LanguageSelector";

interface AppHeaderProps {
	onShowChangelog: () => void;
}

const AppHeaderInternal: React.FC<AppHeaderProps> = ({ onShowChangelog }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { sendEvent } = useAnalytics();

	return (
		<header className="header relative flex flex-col items-center p-4 pb-2 sm:px-8 sm:pt-6 sm:pb-4 lg:rounded-t-xl">
			<div className="!absolute !top-3 !right-4 z-10 flex items-center sm:!top-5 sm:!right-8">
				<Tooltip content={t("buttons.userStats")}>
					<IconButton
						variant="ghost"
						radius="full"
						className="!mr-0 sm:!mr-2"
						aria-label={t("buttons.userStats")}
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
				</Tooltip>
				<LanguageSelector />
				{/* <Tooltip content={t("translationRequest.openDialogLabel")}>
					<IconButton
						className="!ml-2 !hidden h-6 w-6 sm:!inline"
						color="amber"
						radius="full"
						variant="ghost"
						aria-label={
							t("translationRequest.openDialogLabel") || "Open translation request dialog"
						}
						onClick={() => {
							sendEvent({
								category: "User Interactions",
								action: "showTranslations",
								value: 1,
							});
							openDialog("translation");
						}}
					>
						<InfoCircledIcon className="w-4 h-4 sm:h-5 sm:w-5" />
					</IconButton>
				</Tooltip> */}
			</div>

			<h1 className="header__logo--text text-2xl [word-spacing:-.25rem] sm:text-4xl">
				NO MAN&apos;S SKY
			</h1>

			<div className="m-1 mb-2 flex w-full items-center gap-2">
				<Separator size="1" orientation="horizontal" color="cyan" decorative className="flex-1" />
				<RhombusIcon
					className="h-4 w-4 flex-shrink-0 sm:h-4 sm:w-4"
					style={{ color: "var(--accent-track)" }}
				/>
				<Separator size="1" orientation="horizontal" color="cyan" decorative className="flex-1" />
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
				<span className="font-light" style={{ color: "var(--gray-11)" }}>
					{" "}
					v{__APP_VERSION__}
				</span>
				<Tooltip content={t("buttons.changelog")}>
					<IconButton
						variant="ghost"
						radius="full"
						size="1"
						className="!ml-[0px]"
						aria-label={t("buttons.changelog")}
						onClick={() => {
							sendEvent({
								category: "User Interactions",
								action: "showChangelog",
								value: 1,
							});
							onShowChangelog();
						}}
					>
						<CounterClockwiseClockIcon className="mt-[1px] h-4 w-4 sm:h-5 sm:w-5" />
					</IconButton>
				</Tooltip>
			</Heading>
		</header>
	);
};

// Memoize the component
const AppHeader = React.memo(AppHeaderInternal);
export default AppHeader;
