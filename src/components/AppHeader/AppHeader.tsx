// src/components/AppHeader/AppHeader.tsx
import "./AppHeader.css";

import React from "react";
import { CounterClockwiseClockIcon, InfoCircledIcon, PieChartIcon } from "@radix-ui/react-icons";
import { Heading, IconButton, Separator, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

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
			<div className="!absolute !top-2 !right-4 z-10 flex items-center sm:!top-4 sm:!right-8">
				<LanguageSelector />
				<Tooltip content={t("translationRequest.openDialogLabel")}>
					<IconButton
						className="!ml-px !hidden h-6 w-6 sm:!inline"
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
						<InfoCircledIcon className="h-5 w-5" />
					</IconButton>
				</Tooltip>
			</div>

			<h1 className="header__logo--text text-2xl sm:text-4xl">NO MAN&apos;S SKY</h1>

			<div className="m-1 mb-2 flex w-full items-center gap-2">
				<Separator size="1" orientation="horizontal" color="cyan" decorative className="flex-1" />
				<RhombusIcon
					className="h-4 w-4 flex-shrink-0 sm:h-4 sm:w-4"
					style={{ color: "var(--accent-track)" }}
				/>
				<Separator size="1" orientation="horizontal" color="cyan" decorative className="flex-1" />
			</div>

			<Heading
				wrap="pretty"
				align="center"
				as="h2"
				size={{ initial: "2", sm: "3" }}
				className="header__title w-fit"
			>
				<strong>{t("appHeader.subTitle")}</strong>
				<span className="font-light"> v{__APP_VERSION__}</span>

				<div className="mt-1 ml-0 block sm:ml-1 sm:inline">
					<Tooltip content={t("buttons.changelog")}>
						<IconButton
							variant="ghost"
							radius="full"
							size="1"
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
							<CounterClockwiseClockIcon className="mt-[2px] h-4 w-4 sm:mt-[1px] sm:h-5 sm:w-5" />
						</IconButton>
					</Tooltip>
					<Tooltip content={t("buttons.userStats")}>
						<IconButton
							variant="ghost"
							radius="full"
							size="1"
							className="!ml-1 sm:!ml-0"
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
							<PieChartIcon className="mt-[2px] h-4 w-4 sm:mt-[1px] sm:h-5 sm:w-5" />
						</IconButton>
					</Tooltip>
				</div>
			</Heading>
		</header>
	);
};

// Memoize the component
const AppHeader = React.memo(AppHeaderInternal);
export default AppHeader;
