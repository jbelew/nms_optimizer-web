import type { FC } from "react";
import { Suspense } from "react";
import { Button, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { resolveActiveTechVariant } from "@/store/tech/techRules";
import { useTechStore } from "@/store/tech/techStore";
import { determineWindowDimensions } from "@/utils/optimization/windowDimensions";

/**
 * Props for the `OptimizationAlertDialog` component.
 *
 * @remarks
 * All props are optional; when omitted, the dialog subscribes directly to
 * {@link useOptimize} for Pattern No Fit state and actions.
 */
interface OptimizationAlertDialogProps {
	/** Optional override for whether the alert dialog is currently visible. */
	isOpen?: boolean;
	/** Optional override callback to close the dialog. */
	onClose?: () => void;
	/** Optional override callback to trigger a Forced Solve. */
	onForceOptimize?: () => Promise<void>;
	/** Optional override for the Technology Category identifier that triggered the alert. */
	technologyName?: null | string;
}

/**
 * A modal dialog that warns users on a Pattern No Fit optimization result and offers a Forced Solve.
 *
 * @remarks
 * Consumes {@link useOptimize} directly (with optional prop overrides for stories/tests),
 * derives the required Solver Window dimensions from the failed Technology Category
 * and its active Module Selection count in {@link useTechStore}, and provides the user with
 * two choices: dismiss the warning or attempt a Forced Solve using simulated annealing.
 *
 * @returns The rendered dialog, or `null` if no Technology Category is targeted.
 *
 * @see {@link OptimizationAlertDialogProps}
 * @see {@link ./OptimizationAlertDialog.test.tsx Unit Tests}
 * @see {@link ./OptimizationAlertDialog.stories.tsx Storybook}
 * @see {@link AppDialog}
 * @see {@link determineWindowDimensions}
 * @see {@link useOptimize}
 * @see {@link useTechStore}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <OptimizationAlertDialog />
 * // mounts OptimizationAlertDialog
 * ```
 */
const OptimizationAlertDialog: FC<OptimizationAlertDialogProps> = ({
	isOpen: isOpenProp,
	onClose: onCloseProp,
	onForceOptimize: onForceOptimizeProp,
	technologyName: technologyNameProp,
} = {}) => {
	const { t } = useTranslation();
	const { clearPatternNoFitTech, handleForceCurrentPnfOptimize, patternNoFitTech } =
		useOptimize();

	const technologyName = technologyNameProp !== undefined ? technologyNameProp : patternNoFitTech;
	const isOpen = isOpenProp !== undefined ? isOpenProp : Boolean(technologyName);
	const onClose = onCloseProp ?? clearPatternNoFitTech;
	const onForceOptimize = onForceOptimizeProp ?? handleForceCurrentPnfOptimize;

	const categoryKey = technologyName ?? "";

	const { activeVariantType, moduleSelectionCount, technologyCategory } = useTechStore(
		useShallow((state) => ({
			activeVariantType: state.activeGroups?.[categoryKey] || "normal",
			moduleSelectionCount: state.checkedModules?.[categoryKey]?.length ?? 0,
			technologyCategory: state.techGroups?.[categoryKey],
		})),
	);

	if (!technologyName) return null;

	const activeVariant = resolveActiveTechVariant(technologyCategory, activeVariantType);
	const windowDimensions = determineWindowDimensions(
		moduleSelectionCount,
		activeVariant?.window_rules,
	);

	const content = (
		<>
			<span className="errorContent__title block text-center text-xl font-semibold tracking-widest">
				{t("dialogs.optimizationAlert.warning")}
			</span>
			<Text as="p">
				<Trans
					components={{
						1: (
							<span
								className="font-bold uppercase"
								style={{ color: "var(--accent-11)" }}
							/>
						),
					}}
					i18nKey={
						windowDimensions ?
							"dialogs.optimizationAlert.insufficientSpaceWithWindow"
						:	"dialogs.optimizationAlert.insufficientSpace"
					}
					values={
						windowDimensions ?
							{
								height: windowDimensions[1],
								technologyName,
								width: windowDimensions[0],
							}
						:	{ technologyName }
					}
				/>
			</Text>
			<Text as="p">
				<Trans
					components={{
						1: <strong className="font-bold" />,
					}}
					i18nKey="dialogs.optimizationAlert.forceOptimizeSuggestion"
				/>
			</Text>
		</>
	);

	const footer = (
		<>
			<Button
				aria-label={t("dialogs.optimizationAlert.cancelButton")}
				onClick={onClose}
				variant="soft"
			>
				{t("dialogs.optimizationAlert.cancelButton")}
			</Button>
			<Button
				aria-label={t("dialogs.optimizationAlert.forceOptimizeButton")}
				onClick={async () => {
					await onForceOptimize();
				}}
			>
				{t("dialogs.optimizationAlert.forceOptimizeButton")}
			</Button>
		</>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				content={content}
				footer={footer}
				isOpen={isOpen}
				onClose={onClose}
				title={t("dialogs.titles.optimizationAlert")}
				titleKey="dialogs.titles.optimizationAlert"
			/>
		</Suspense>
	);
};

export default OptimizationAlertDialog;
