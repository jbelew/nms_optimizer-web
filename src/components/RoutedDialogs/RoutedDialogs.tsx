// src/components/RoutedDialogs/RoutedDialogs.tsx
import type { FC } from "react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import AppDialog from "../AppDialog/AppDialog";
import MarkdownContentRenderer from "../AppDialog/MarkdownContentRenderer";
import UserStatsDialog from "../AppDialog/UserStatsDialog";

export const RoutedDialogs: FC = () => {
	const { t } = useTranslation();
	const { activeDialog, closeDialog, sectionToScrollTo } = useDialog();

	// Memoize content elements for dialogs
	const aboutDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="about" />,
		[]
	);
	const instructionsDialogContent = useMemo(
		() => (
			<MarkdownContentRenderer
				markdownFileName="instructions"
				targetSectionId={sectionToScrollTo}
			/>
		),
		[sectionToScrollTo]
	);
	const changelogDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="changelog" />,
		[]
	);
	const translationRequestDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="translation-request" />,
		[]
	);

	return (
		<>
			{/* Dialog for "About" information */}
			<AppDialog
				isOpen={activeDialog === "about"}
				onClose={closeDialog}
				titleKey="dialogs.titles.about"
				title={t("dialogs.titles.about")}
				content={aboutDialogContent}
			/>
			{/* Dialog for "Instructions" information */}
			<AppDialog
				isOpen={activeDialog === "instructions"}
				onClose={closeDialog}
				titleKey="dialogs.titles.instructions"
				title={t("dialogs.titles.instructions")}
				content={instructionsDialogContent}
			/>
			{/* Dialog for "Changelog" information */}
			<AppDialog
				isOpen={activeDialog === "changelog"}
				onClose={closeDialog}
				titleKey="dialogs.titles.changelog"
				title={t("dialogs.titles.changelog")}
				content={changelogDialogContent}
			/>
			{/* Dialog for "Translation Request" information */}
			<AppDialog
				isOpen={activeDialog === "translation"}
				onClose={closeDialog}
				titleKey="dialogs.titles.translationRequest"
				title={t("dialogs.titles.translationRequest")}
				content={translationRequestDialogContent}
			/>
			{/* Dialog for "User Stats" information */}
			<UserStatsDialog isOpen={activeDialog === "userstats"} onClose={closeDialog} />
		</>
	);
};
