import { FC, lazy, useEffect } from "react";
import { Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePerformanceData } from "@/hooks/usePerformanceData/usePerformanceData";
import { fetchPerformanceData } from "@/utils/api/performanceResource";

const PerformanceChart = lazy(() => import("./PerformanceChart"));

/**
 * Data orchestration component for performance metrics.
 *
 * @remarks
 * This component handles the data lifecycle for the performance dashboard:
 * 1. Triggers an eager fetch via `fetchPerformanceData` when the dialog opens.
 * 2. Consumes the streamable data via the `usePerformanceData` hook.
 * 3. Renders the lazy-loaded `PerformanceChart` visualization.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Indicates if the parent dialog is visible.
 *
 * @returns {JSX.Element} The performance dashboard UI or a "no data" message.
 *
 * @see {@link PerformanceChart}
 * @see {@link fetchPerformanceData}
 * @see {@link usePerformanceData}
 * @see {@link ./PerformanceData.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <PerformanceData isOpen={true} />
 * ```
 */
export const PerformanceData: FC<{ isOpen: boolean }> = ({ isOpen }) => {
	const { t } = useTranslation();

	useEffect(() => {
		if (isOpen) {
			fetchPerformanceData();
		}
	}, [isOpen]);

	const data = usePerformanceData();

	if (!data || data.length === 0) {
		return <Text>{t("dialogs.performance.noData", "No performance data available.")}</Text>;
	}

	return <PerformanceChart data={data} />;
};

export default PerformanceData;
