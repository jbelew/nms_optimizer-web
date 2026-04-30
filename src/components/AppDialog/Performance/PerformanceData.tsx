import { FC, useEffect } from "react";
import { Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { usePerformanceData } from "@/hooks/usePerformanceData/usePerformanceData";
import { fetchPerformanceData } from "@/utils/api/performanceResource";

import { PerformanceChart } from "./PerformanceChart";

/**
 * Data orchestration component for performance metrics.
 *
 * @remarks
 * This component handles the data lifecycle for the performance dashboard:
 * 1. Triggers an eager fetch via `fetchPerformanceData` when the dialog opens.
 * 2. Consumes the streamable data via the `usePerformanceData` hook.
 * 3. Renders the specialized timeseries visualizations.
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
			<PerformanceChart data={data} />
		</Flex>
	);
};

export default PerformanceData;
