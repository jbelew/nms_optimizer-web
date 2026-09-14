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
import { getRoutedDialogs } from "@shared/page-registry.js";
import { useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import LoremIpsumSkeleton from "@/components/AppDialog/Common/LoremIpsumSkeleton";
import { useDialog } from "@/utils/system/dialogUtils";

const MarkdownContentRenderer = lazy(() =>
	import("@/components/AppDialog/Markdown/MarkdownContentRenderer").then((m) => ({
		default: m.MarkdownContentRenderer,
	}))
);

/**
 * Filtered list of markdown-rendered routed dialogs from the Unified Page Registry.
 */
const MARKDOWN_DIALOGS = getRoutedDialogs().filter((d) => d.componentType === "markdown");

/**
 * A central orchestrator for dialogs that are mapped to specific application routes.
 *
 * @remarks
 * It monitors the `activeDialog` state from the `DialogContext` and renders the
 * corresponding `AppDialog` with its specific content directly derived from the
 * Unified Page Registry. This component enables a "modal as a page" experience
 * where dialogs have unique URLs and can be bookmarked.
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
			{MARKDOWN_DIALOGS.map((dialog) => (
				<AppDialog
					content={
						<Suspense fallback={<LoremIpsumSkeleton />}>
							<MarkdownContentRenderer
								markdownFileName={dialog.markdownFileName || dialog.id}
								targetSectionId={
									dialog.id === "instructions" ? sectionToScrollTo : undefined
								}
							/>
						</Suspense>
					}
					footer={footer}
					isOpen={activeDialog === dialog.id}
					key={dialog.id}
					onClose={closeDialog}
					pageId={dialog.id}
				/>
			))}
		</Suspense>
	);
};
