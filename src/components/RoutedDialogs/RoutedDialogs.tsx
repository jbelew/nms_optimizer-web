/**
 * Routing-integrated dialog orchestrator module.
 *
 * @remarks
 * This module provides the `RoutedDialogs` component, which maps specific
 * application routes to modal dialogs, enabling shareable URLs for
 * informational content.
 *
 * @see {@link RoutedDialogs}
 *
 * @category Components
 */

import type { FC } from "react";
import { lazy, Suspense } from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../utils/system/dialogUtils";
import LoremIpsumSkeleton from "../AppDialog/Common/LoremIpsumSkeleton";

const AppDialog = lazy(() => import("../AppDialog/Base/AppDialog"));
const MarkdownContentRenderer = lazy(() => import("../AppDialog/Markdown/MarkdownContentRenderer"));

/**
 * A central orchestrator for dialogs that are mapped to specific application routes.
 *
 * @remarks
 * It monitors the `activeDialog` state from the `DialogContext` and renders the
 * corresponding `AppDialog` with its specific content (usually markdown-based).
 * This component enables a "modal as a page" experience where dialogs have
 * unique URLs and can be bookmarked.
 *
 * @returns {JSX.Element} A collection of potentially visible dialog components.
 *
 * @see {@link useDialog}
 * @see {@link AppDialog}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <RoutedDialogs />
 * // renders active dialog based on route
 * ```
 */
export const RoutedDialogs: FC = () => {
	const { t } = useTranslation();
	const { activeDialog, closeDialog, sectionToScrollTo } = useDialog();

	const footer = (
		<div className="flex justify-end gap-2">
			<Button variant="soft" onClick={closeDialog}>
				{t("common.closeDialog")}
			</Button>
		</div>
	);

	return (
		<Suspense fallback={null}>
			{/* Dialog for "About" information */}
			<AppDialog
				isOpen={activeDialog === "about"}
				onClose={closeDialog}
				titleKey="dialogs.titles.about"
				title={t("dialogs.titles.about")}
				footer={footer}
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
				footer={footer}
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
				footer={footer}
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
				footer={footer}
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer markdownFileName="translation-request" />
					</Suspense>
				}
			/>
			{/* Dialog for "Privacy Policy" information */}
			<AppDialog
				isOpen={activeDialog === "privacy"}
				onClose={closeDialog}
				titleKey="dialogs.titles.privacy"
				title={t("dialogs.titles.privacy")}
				footer={footer}
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer markdownFileName="privacy" />
					</Suspense>
				}
			/>
		</Suspense>
	);
};
