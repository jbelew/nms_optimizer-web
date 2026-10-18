/**
 * Routing-integrated dialog orchestrator module.
 *
 * @remarks
 * This module provides the `RoutedDialogs` component, which maps specific
 * application routes to modal dialogs (both markdown content dialogs and
 * custom dashboard dialogs like User Stats and Performance), enabling
 * shareable URLs for all Routed Dialogs.
 *
 * @see {@link RoutedDialogs}
 *
 * @category Components
 */

import type { FC } from "react";
import { lazy, Suspense } from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import LoremIpsumSkeleton from "@/components/AppDialog/Common/LoremIpsumSkeleton";
import { useDialog } from "@/utils/system/dialogUtils";
import { getRoutedDialogs } from "@shared/page-registry.js";

const IS_DOCKER_BUILD = import.meta.env.VITE_DOCKER === "true";

const MarkdownContentRenderer = lazy(() =>
	import("@/components/AppDialog/Markdown/MarkdownContentRenderer").then((m) => ({
		default: m.MarkdownContentRenderer,
	})),
);

const UserStatsDialog = lazy(() => import("@/components/AppDialog/UserStats/UserStatsDialog"));

const PerformanceDialog = lazy(
	() => import("@/components/AppDialog/Performance/PerformanceDialog"),
);

const CUSTOM_DIALOGS = {
	performance: PerformanceDialog,
	userstats: UserStatsDialog,
} as const;

/**
 * Filtered list of markdown-rendered Routed Dialogs from the Unified Page Registry.
 */
const MARKDOWN_DIALOGS = getRoutedDialogs().filter((d) => d.componentType === "markdown");

/**
 * Central orchestrator for all Routed Dialogs mapped to canonical application routes.
 *
 * @remarks
 * Monitors `activeDialog` from {@link useDialog} and renders either the matching
 * markdown `AppDialog` or the lazy-loaded `UserStatsDialog` / `PerformanceDialog`
 * (when not in a Docker build).
 *
 * @returns The active Routed Dialog container, or `null` when suppressed.
 *
 * @see {@link useDialog}
 * @see {@link AppDialog}
 * @see {@link ./RoutedDialogs.integration.test.tsx Integration Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <RoutedDialogs />
 * // renders active Routed Dialog based on route
 * ```
 */
export const RoutedDialogs: FC = () => {
	const { t } = useTranslation();
	const { activeDialog, closeDialog, sectionToScrollTo } = useDialog();

	if (activeDialog && activeDialog in CUSTOM_DIALOGS) {
		if (IS_DOCKER_BUILD) return null;

		const CustomDialog = CUSTOM_DIALOGS[activeDialog as keyof typeof CUSTOM_DIALOGS];

		return (
			<Suspense fallback={null}>
				<CustomDialog
					isOpen={true}
					onClose={closeDialog}
				/>
			</Suspense>
		);
	}

	const footer = (
		<div className="flex justify-end gap-2">
			<Button
				onClick={closeDialog}
				variant="soft"
			>
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
