import { FC, Suspense, useEffect, useState } from "react";
import { Flex, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import {
	PerformanceMetric,
	usePerformanceData,
} from "@/hooks/usePerformanceData/usePerformanceData";
import { fetchPerformanceData } from "@/utils/api/performanceResource";

import { PerformanceChart } from "./PerformanceChart";

/**
 * Properties for the LazyChartLoader component.
 */
interface LazyChartLoaderProps {
	/** Raw performance data to be passed to the loaded chart. */
	data: PerformanceMetric[];
}

/**
 * Lazily loads the Recharts library and renders the performance chart.
 *
 * @remarks
 * This wrapper ensures that the heavy Recharts library is only loaded when
 * the performance dashboard is actually opened, improving initial bundle size.
 *
 * @param {LazyChartLoaderProps} props - Component properties.
 *
 * @returns {JSX.Element} A loading skeleton or the rendered PerformanceChart.
 *
 * @example
 * ```tsx
 * // Dynamically loads Recharts and renders the chart
 * <LazyChartLoader data={performanceData} />
 * ```
 */
const LazyChartLoader: FC<LazyChartLoaderProps> = ({ data }) => {
	const [recharts, setRecharts] = useState<typeof import("recharts") | null>(null);

	useEffect(() => {
		import("recharts").then((mod) => setRecharts(mod));
	}, []);

	if (!recharts) {
		return <Skeleton height="434px" width="100%" />;
	}

	return <PerformanceChart data={data} recharts={recharts} />;
};

/**
 * Data orchestration component for performance metrics.
 *
 * @remarks
 * This component handles the data lifecycle for the performance dashboard:
 * 1. Triggers an eager fetch via `fetchPerformanceData` when the dialog opens.
 * 2. Consumes the streamable data via the `usePerformanceData` hook.
 * 3. Manages loading states using React `<Suspense>`.
 * 4. Renders the specialized timeseries visualizations.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Indicates if the parent dialog is visible.
 *
 * @returns {JSX.Element} The performance dashboard UI or a "no data" message.
 *
 * @see {@link PerformanceChart}
 * @see {@link fetchPerformanceData}
 * @see {@link usePerformanceData}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * // Mounts the performance dashboard orchestration component
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

	return (
		<Flex direction="column" gap="4" style={{ overflow: "hidden" }}>
			<Suspense fallback={<Skeleton height="434px" width="100%" />}>
				<LazyChartLoader data={data} />
			</Suspense>
		</Flex>
	);
};

export default PerformanceData;
