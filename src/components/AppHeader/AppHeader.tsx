// src/components/AppHeader/AppHeader.tsx
import "./AppHeader.css";

import { CounterClockwiseClockIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Heading,IconButton, Separator, Tooltip } from "@radix-ui/themes";
import React from "react";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useAnalytics } from "../../hooks/useAnalytics";
import RhombusIcon from "../icons/RhombusIcon";
import LanguageSelector from "../LanguageSelector/LanguageSelector";

interface AppHeaderProps {
	onShowChangelog: () => void;
}

const AppHeaderInternal: React.FC<AppHeaderProps> = ({ onShowChangelog }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { sendEvent } = useAnalytics();

	return (
		<header className="relative flex flex-col items-center p-4 pb-2 sm:px-8 sm:pt-6 sm:pb-4 header lg:rounded-t-xl">
			<div className="!absolute !top-2 !right-4 sm:!top-4 sm:!right-8 z-10 flex items-center">
				<LanguageSelector />
				<Tooltip content={t("translationRequest.openDialogLabel")}>
					<IconButton
						className="!ml-px !hidden sm:!inline"
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
							});
							openDialog("translation");
						}}
					>
						<InfoCircledIcon />
					</IconButton>
				</Tooltip>
			</div>
			<h1 className="text-2xl sm:text-4xl header__logo--text">NO MAN&apos;S SKY</h1>

			<div className="flex items-center w-full gap-2 m-1 mb-2">
				<Separator size="1" orientation="horizontal" color="cyan" decorative className="flex-1" />
				<RhombusIcon
					className="flex-shrink-0 w-4 h-4 sm:w-4 sm:h-4"
					style={{ color: "var(--accent-track)" }}
				/>
				<Separator size="1" orientation="horizontal" color="cyan" decorative className="flex-1" />
			</div>

			<Heading
				wrap="pretty"
				align="center"
				as="h2"
				size={{ initial: "2", sm: "3" }}
				className="header__title"
			>
				<strong>{t("appHeader.subTitle")}</strong>
				<span className="font-thin"> v{__APP_VERSION__}</span>&nbsp;&nbsp;
				<Tooltip content={t("buttons.changelog")}>
					<IconButton
						className="shadow-sm"
						variant="ghost"
						radius="full"
						size="2"
						aria-label={t("buttons.changelog")}
						onClick={() => {
							sendEvent({
								category: "User Interactions",
								action: "showChangelog",
							});
							onShowChangelog();
						}}
					>
						<CounterClockwiseClockIcon className="mt-[2px] sm:mt-[1px] w-4 h-4 sm:w-5 sm:h-5" />
					</IconButton>
				</Tooltip>
			</Heading>
		</header>
	);
};

// Memoize the component
const AppHeader = React.memo(AppHeaderInternal);
export default AppHeader;
