import type { FC } from "react";
import { Suspense } from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";

import { PerformanceContent } from "./performanceContent";

/**
 * Props for the `PerformanceDialog` component.
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
 * @see {@link PerformanceContent}
 * @see {@link AppDialog}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <PerformanceDialog isOpen={true} onClose={handleClose} />
 * ```
 */
const PerformanceDialog: FC<PerformanceDialogProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();

	const footer = (
		<div className="flex justify-end gap-2">
			<Button onClick={onClose} variant="soft">
				{t("dialogs.performance.closeButton", "Close")}
			</Button>
		</div>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				content={<PerformanceContent isOpen={isOpen} />}
				footer={footer}
				isOpen={isOpen}
				onClose={onClose}
				size="wide"
				title={t("dialogs.titles.performance", "Performance Metrics")}
				titleKey="dialogs.titles.performance"
			/>
		</Suspense>
	);
};

export default PerformanceDialog;
