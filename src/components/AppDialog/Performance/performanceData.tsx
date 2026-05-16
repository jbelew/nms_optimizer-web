import type { FC } from "react";
import { lazy, useEffect, useState, useTransition } from "react";
import { Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePerformanceData } from "@/hooks/usePerformanceData/usePerformanceData";
import { fetchPerformanceData } from "@/utils/api/performanceResource";
import { safeGetItem, safeSetItem } from "@/utils/browser/environment";

const PerformanceChart = lazy(() =>
	import("./performanceChart").then((m) => ({ default: m.PerformanceChart }))
);

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
	const [range, setRange] = useState(() => {
		const saved = safeGetItem("nms-perf-range");

		if (saved) {
			const parsed = parseInt(saved, 10);

			if (!isNaN(parsed) && [3, 7, 14].includes(parsed)) {
				return parsed;
			}
		}

		return 3;
	});
	const [isPending, startTransition] = useTransition();

	// Always fetch the maximum range (14 days) to ensure the summary cards (latest hour)
	// and trends (prior hour) remain absolute and stable regardless of the
	// user's selected chart view. This also prevents redundant network requests
	// when switching between 3d, 7d, and 14d views.
	const fetchRange = "14daysAgo";

	useEffect(() => {
		if (isOpen) {
			fetchPerformanceData(fetchRange);
		}
	}, [isOpen]);

	const data = usePerformanceData(fetchRange);

	const handleRangeChange = (newRange: number) => {
		// Always wrap in startTransition so the heavy synchronous chart
		// re-render (data transformation + Recharts) keeps the SegmentedControl
		// responsive, regardless of whether the network data is already cached.
		startTransition(() => {
			setRange(newRange);
			safeSetItem("nms-perf-range", newRange.toString());
		});
	};

	if (!data || data.length === 0) {
		return <Text>{t("dialogs.performance.noData", "No performance data available.")}</Text>;
	}

	return (
		<PerformanceChart
			data={data}
			isPending={isPending}
			onRangeChange={handleRangeChange}
			range={range}
		/>
	);
};
