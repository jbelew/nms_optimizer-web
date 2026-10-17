import type { FC } from "react";
import { Suspense } from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import { resolveActiveTechVariant } from "@/store/tech/techRules";
import { useTechStore } from "@/store/tech/techStore";
import { determineWindowDimensions } from "@/utils/optimization/windowDimensions";

import { OptimizationAlertContent } from "./OptimizationAlertContent";

/**
 * Props for the `OptimizationAlertDialog` component.
 */
interface OptimizationAlertDialogProps {
	/** Whether the alert dialog is currently visible. */
	isOpen: boolean;
	/** Callback function to close the dialog. */
	onClose: () => void;
	/** Asynchronous callback to trigger a "forced" optimization solve. */
	onForceOptimize: () => Promise<void>;
	/** The Technology Category identifier that triggered the alert. `null` to suppress. */
	technologyName: null | string;
}

/**
 * A specialized dialog component that warns users when a pattern-based optimization fails.
 *
 * @remarks
 * This component derives the required Solver Window dimensions from the failed Technology Category
 * and its active Module Selection count in {@link useTechStore}, and provides the user with
 * two choices: dismiss the warning or attempt a "forced" solve using more intensive algorithms.
 * It wraps the {@link OptimizationAlertContent} inside a standard {@link AppDialog}.
 *
 * @param {OptimizationAlertDialogProps} props - Component properties.
 *
 * @returns {JSX.Element | null} The rendered dialog, or `null` if no technology is targeted.
 *
 * @see {@link ./OptimizationAlertDialog.test.tsx Unit Tests}
 * @see {@link ./OptimizationAlertDialog.stories.tsx Storybook}
 * @see {@link AppDialog}
 * @see {@link OptimizationAlertContent}
 * @see {@link determineWindowDimensions}
 * @see {@link useTechStore}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <OptimizationAlertDialog
 *   isOpen={isWarningVisible}
 *   technologyName="pulse"
 *   onClose={hideFn}
 *   onForceOptimize={forceFn}
 * />
 * ```
 */
const OptimizationAlertDialog: FC<OptimizationAlertDialogProps> = ({
	isOpen,
	onClose,
	onForceOptimize,
	technologyName,
}) => {
	const { t } = useTranslation();
	const categoryKey = technologyName ?? "";

	const { activeVariantType, moduleSelectionCount, technologyCategory } = useTechStore(
		useShallow((state) => ({
			activeVariantType: state.activeGroups?.[categoryKey] || "normal",
			moduleSelectionCount: state.checkedModules?.[categoryKey]?.length ?? 0,
			technologyCategory: state.techGroups?.[categoryKey],
		}))
	);

	if (!technologyName) return null;

	const activeVariant = resolveActiveTechVariant(technologyCategory, activeVariantType);
	const windowDimensions = determineWindowDimensions(
		moduleSelectionCount,
		activeVariant?.window_rules
	);

	const footer = (
		<div className="flex justify-end gap-2">
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
		</div>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				content={
					<OptimizationAlertContent
						technologyName={technologyName}
						windowDimensions={windowDimensions}
					/>
				}
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
