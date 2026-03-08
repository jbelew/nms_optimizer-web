// src/components/RoutedDialogs/RoutedDialogs.tsx
import type { FC } from "react";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import AppDialog from "../AppDialog/AppDialog";
import LoremIpsumSkeleton from "../AppDialog/LoremIpsumSkeleton";

const MarkdownContentRenderer = lazy(() => import("../AppDialog/MarkdownContentRenderer"));

/**
 * RoutedDialogs component manages and renders various application dialogs based on the active dialog state.
 * It uses `AppDialog` and `UserStatsDialog` to display different types of content.
 */
export const RoutedDialogs: FC = () => {
	const { t } = useTranslation();
	const { activeDialog, closeDialog, sectionToScrollTo } = useDialog();

	return (
		<>
			{/* Dialog for "About" information */}
			<AppDialog
				isOpen={activeDialog === "about"}
				onClose={closeDialog}
				titleKey="dialogs.titles.about"
				title={t("dialogs.titles.about")}
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer markdownFileName="about" />
					</Suspense>
				}
			/>
			{/* Dialog for "Instructions" information */}
			<AppDialog
				isOpen={activeDialog === "instructions"}
				onClose={closeDialog}
				titleKey="dialogs.titles.instructions"
				title={t("dialogs.titles.instructions")}
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer
							markdownFileName="instructions"
							targetSectionId={sectionToScrollTo}
						/>
					</Suspense>
				}
			/>
			{/* Dialog for "Changelog" information */}
			<AppDialog
				isOpen={activeDialog === "changelog"}
				onClose={closeDialog}
				titleKey="dialogs.titles.changelog"
				title={t("dialogs.titles.changelog")}
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer markdownFileName="changelog" />
					</Suspense>
				}
			/>
			{/* Dialog for "Translation Request" information */}
			<AppDialog
				isOpen={activeDialog === "translation"}
				onClose={closeDialog}
				titleKey="dialogs.titles.translationRequest"
				title={t("dialogs.titles.translationRequest")}
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer markdownFileName="translation-request" />
					</Suspense>
				}
			/>
		</>
	);
};
