import type { FC } from "react";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";

import { OptimizationAlertContent } from "./OptimizationAlertContent";

const AppDialog = lazy(() => import("../Base/AppDialog"));

/**
 * Props for the `OptimizationAlertDialog` component.
 */
interface OptimizationAlertDialogProps {
	/** Whether the alert dialog is currently visible. */
	isOpen: boolean;
	/** The display name of the technology that triggered the alert. `null` to suppress. */
	technologyName: string | null;
	/** Callback function to close the dialog. */
	onClose: () => void;
	/** Asynchronous callback to trigger a "forced" optimization solve. */
	onForceOptimize: () => Promise<void>;
}

/**
 * A specialized dialog component that warns users when a pattern-based optimization fails.
 *
 * @remarks
 * This component provides the user with two choices: dismiss the warning or attempt a "forced" solve
 * using more intensive algorithms. It wraps the {@link OptimizationAlertContent} inside
 * a standard {@link AppDialog}.
 *
 * @param {OptimizationAlertDialogProps} props - Component properties.
 *
 * @returns {JSX.Element | null} The rendered dialog, or `null` if no technology is targeted.
 *
 * @see {@link ./OptimizationAlertDialog.test.tsx Unit Tests}
 * @see {@link ./OptimizationAlertDialog.stories.tsx Storybook}
 * @see {@link AppDialog}
 * @see {@link OptimizationAlertContent}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <OptimizationAlertDialog
 *   isOpen={isWarningVisible}
 *   technologyName="Hyperdrive"
 *   onClose={hideFn}
 *   onForceOptimize={forceFn}
 * />
 * ```
 */
const OptimizationAlertDialog: FC<OptimizationAlertDialogProps> = ({
	isOpen,
	technologyName,
	onClose,
	onForceOptimize,
}) => {
	const { t } = useTranslation();

	if (!technologyName) return null;

	return (
		<Suspense fallback={null}>
			<AppDialog
				isOpen={isOpen}
				onClose={onClose}
				titleKey="dialogs.titles.optimizationAlert"
				title={t("dialogs.titles.optimizationAlert")}
				content={
					<OptimizationAlertContent
						technologyName={technologyName}
						onClose={onClose}
						onForceOptimize={onForceOptimize}
					/>
				}
			/>
		</Suspense>
	);
};

export default OptimizationAlertDialog;
