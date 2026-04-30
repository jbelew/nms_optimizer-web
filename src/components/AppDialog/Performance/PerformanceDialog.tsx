import type { FC } from "react";
import { lazy, Suspense } from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { PerformanceContent } from "./PerformanceContent";

const AppDialog = lazy(() => import("../Base/AppDialog"));

/**
 * Props for the `PerformanceDialog` component.
 *
 * @category Props
 */
interface PerformanceDialogProps {
	/** Whether the performance dialog is currently visible in the UI. */
	isOpen: boolean;
	/** Callback function triggered when the user requests to close the dialog. */
	onClose: () => void;
}

/**
 * A modal dialog that displays aggregate application performance statistics.
 *
 * @remarks
 * This component acts as a container for the `PerformanceContent`. It is designed
 * to be code-split along with its charting dependencies. It uses a `wide`
 * layout to accommodate the timeseries Area chart.
 *
 * @param {PerformanceDialogProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered performance dialog.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <PerformanceDialog isOpen={true} onClose={hide} />
 * ```
 */
const PerformanceDialog: FC<PerformanceDialogProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();

	const footer = (
		<div className="flex justify-end gap-2">
			<Button variant="soft" onClick={onClose}>
				{t("dialogs.performance.closeButton", "Close")}
			</Button>
		</div>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				isOpen={isOpen}
				onClose={onClose}
				size="wide"
				titleKey="dialogs.titles.performance"
				title={t("dialogs.titles.performance", "Performance Metrics")}
				footer={footer}
				content={<PerformanceContent isOpen={isOpen} />}
			/>
		</Suspense>
	);
};

export default PerformanceDialog;
