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
const MarkdownContentRenderer = lazy(() =>
	import("../AppDialog/Markdown/markdownContentRenderer").then((m) => ({
		default: m.MarkdownContentRenderer,
	}))
);

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
			<Button onClick={closeDialog} variant="soft">
				{t("common.closeDialog")}
			</Button>
		</div>
	);

	return (
		<Suspense fallback={null}>
			{/* Dialog for "About" information */}
			<AppDialog
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer markdownFileName="about" />
					</Suspense>
				}
				footer={footer}
				isOpen={activeDialog === "about"}
				onClose={closeDialog}
				title={t("dialogs.titles.about")}
				titleKey="dialogs.titles.about"
			/>
			{/* Dialog for "Instructions" information */}
			<AppDialog
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer
							markdownFileName="instructions"
							targetSectionId={sectionToScrollTo}
						/>
					</Suspense>
				}
				footer={footer}
				isOpen={activeDialog === "instructions"}
				onClose={closeDialog}
				title={t("dialogs.titles.instructions")}
				titleKey="dialogs.titles.instructions"
			/>
			{/* Dialog for "Changelog" information */}
			<AppDialog
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer markdownFileName="changelog" />
					</Suspense>
				}
				footer={footer}
				isOpen={activeDialog === "changelog"}
				onClose={closeDialog}
				title={t("dialogs.titles.changelog")}
				titleKey="dialogs.titles.changelog"
			/>
			{/* Dialog for "Translation Request" information */}
			<AppDialog
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer markdownFileName="translation-request" />
					</Suspense>
				}
				footer={footer}
				isOpen={activeDialog === "translation"}
				onClose={closeDialog}
				title={t("dialogs.titles.translationRequest")}
				titleKey="dialogs.titles.translationRequest"
			/>
			{/* Dialog for "Privacy Policy" information */}
			<AppDialog
				content={
					<Suspense fallback={<LoremIpsumSkeleton />}>
						<MarkdownContentRenderer markdownFileName="privacy" />
					</Suspense>
				}
				footer={footer}
				isOpen={activeDialog === "privacy"}
				onClose={closeDialog}
				title={t("dialogs.titles.privacy")}
				titleKey="dialogs.titles.privacy"
			/>
		</Suspense>
	);
};
