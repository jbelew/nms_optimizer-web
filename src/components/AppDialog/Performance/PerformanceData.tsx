import { FC, lazy, useEffect, useState, useTransition } from "react";
import { Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePerformanceData } from "@/hooks/usePerformanceData/usePerformanceData";
import { fetchPerformanceData, isPerformanceDataCached } from "@/utils/api/performanceResource";

const PerformanceChart = lazy(() => import("./PerformanceChart"));

/**
 * Data orchestration component for performance metrics.
 *
 * @remarks
 * This component handles the data lifecycle for the performance dashboard:
 * 1. Triggers an eager fetch via `fetchPerformanceData` when the dialog opens.
 * 2. Manages the selected date range (3, 7, or 14 days).
 * 3. Consumes the streamable data via the `usePerformanceData` hook.
 * 4. Renders the lazy-loaded `PerformanceChart` visualization.
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
	const [range, setRange] = useState(3);
	const [isPending, startTransition] = useTransition();

	const startDate = `${range}daysAgo`;

	useEffect(() => {
		if (isOpen) {
			fetchPerformanceData(startDate);
		}
	}, [isOpen, startDate]);

	const data = usePerformanceData(startDate);

	const handleRangeChange = (newRange: number) => {
		const nextStartDate = `${newRange}daysAgo`;

		if (isPerformanceDataCached(nextStartDate)) {
			// If cached, just set it directly to avoid the transition dimming
			setRange(newRange);
		} else {
			// Otherwise use transition to show feedback while fetching
			startTransition(() => {
				setRange(newRange);
			});
		}
	};

	if (!data || data.length === 0) {
		return <Text>{t("dialogs.performance.noData", "No performance data available.")}</Text>;
	}

	return (
		<PerformanceChart
			data={data}
			range={range}
			onRangeChange={handleRangeChange}
			isPending={isPending}
		/>
	);
};

export default PerformanceData;
