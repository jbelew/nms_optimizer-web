import type { PerformanceChart } from "./PerformanceChart";
import { FC } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Label,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { MetricDetailChart } from "./MetricDetailChart";
import { ChartDataPoint } from "./PerformanceTypes";
import {
	CHART_HEIGHT,
	CHART_MARGIN_BOTTOM,
	CHART_TOOLTIP_STYLE,
	formatMetricValue,
	getMetricColor,
	METRIC_DISPLAY_ORDER,
} from "./PerformanceUtils";

interface PerformanceChartsContainerProps {
	selectedMetric: string | null;
	chartData: ChartDataPoint[];
	uniqueMetrics: string[];
	versionChanges: { timestamp: number; version: string }[];
	locale: string;
}

/**
 * Orchestrates the rendering of the performance charts.
 *
 * @remarks
 * This component is lazy-loaded to isolate heavy Recharts dependencies.
 * It conditionally renders either the aggregate stacked Area chart or
 * a detailed MetricDetailChart for a specific selection.
 *
 * @param {PerformanceChartsContainerProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered chart area.
 *
 * @see {@link MetricDetailChart}
 * @see {@link PerformanceChart}
 * @see {@link ChartDataPoint}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * // Renders the aggregate stacked chart
 * <PerformanceChartsContainer
 *   selectedMetric={null}
 *   chartData={transformedData}
 *   uniqueMetrics={["LCP", "FCP"]}
 *   versionChanges={[]}
 *   locale="en"
 * />
 * ```
 */
export const PerformanceChartsContainer: FC<PerformanceChartsContainerProps> = ({
	selectedMetric,
	chartData,
	uniqueMetrics,
	versionChanges,
	locale,
}) => {
	const activeMetrics = METRIC_DISPLAY_ORDER.filter((m) => uniqueMetrics.includes(m));
	const stackOrder = activeMetrics;

	if (selectedMetric) {
		return (
			<MetricDetailChart
				metric={selectedMetric}
				chartData={chartData}
				versionChanges={versionChanges}
				locale={locale}
			/>
		);
	}

	return (
		<div style={{ height: CHART_HEIGHT, marginBottom: CHART_MARGIN_BOTTOM }}>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-5)" />
					{versionChanges.map((change) => (
						<ReferenceLine
							key={change.timestamp}
							x={change.timestamp}
							stroke="var(--gray-7)"
							strokeDasharray="2 4"
							strokeWidth={1}
						>
							<Label
								value={
									change.version.startsWith("v")
										? change.version
										: `v${change.version}`
								}
								position="insideTopLeft"
								fill="var(--gray-10)"
								fontSize={10}
								fontWeight={600}
								offset={4}
							/>
						</ReferenceLine>
					))}
					<XAxis
						dataKey="timestamp"
						type="number"
						scale="time"
						domain={["dataMin", "dataMax"]}
						axisLine={false}
						tickLine={false}
						tick={{ fill: "var(--gray-11)", fontSize: 11, fontWeight: 500 }}
						minTickGap={40}
						tickFormatter={(val) =>
							new Intl.DateTimeFormat(locale, {
								month: "numeric",
								day: "numeric",
							}).format(new Date(val))
						}
					/>
					<YAxis
						axisLine={false}
						tickLine={false}
						width={40}
						tick={{ fill: "var(--gray-11)", fontSize: 11, fontWeight: 500 }}
					/>
					<Tooltip
						itemSorter={(item) => activeMetrics.indexOf(item.dataKey as string)}
						wrapperStyle={{ pointerEvents: "none" }}
						allowEscapeViewBox={{ x: false, y: false }}
						isAnimationActive={false}
						offset={10}
						labelFormatter={(_label, payload) => {
							const item = payload[0]?.payload as ChartDataPoint | undefined;
							const baseLabel = item
								? `${item.displayDate} ${item.hour}`
								: String(_label);

							return item?.appVersion
								? `${baseLabel} (${item.appVersion})`
								: baseLabel;
						}}
						formatter={(value, name, props: { payload?: Record<string, unknown> }) => {
							const originalValue = props.payload?.[`${name}_original`];
							const numericValue =
								typeof originalValue === "number"
									? originalValue
									: typeof value === "number"
										? value
										: 0;

							return [formatMetricValue(String(name), numericValue), String(name)];
						}}
						contentStyle={CHART_TOOLTIP_STYLE}
					/>
					{stackOrder.map((metric) => (
						<Area
							key={metric}
							type="basis"
							dataKey={metric}
							stackId="1"
							stroke={getMetricColor(metric, 11)}
							fill={getMetricColor(metric, 10)}
							fillOpacity={0.9}
							strokeWidth={2}
							connectNulls
						/>
					))}
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default PerformanceChartsContainer;
