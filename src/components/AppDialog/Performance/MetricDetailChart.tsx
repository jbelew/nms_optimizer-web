import { FC } from "react";
import { Flex, Text } from "@radix-ui/themes";
import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Label,
	Line,
	ReferenceArea,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { ChartDataPoint } from "./PerformanceTypes";
import {
	CHART_HEIGHT,
	CHART_MARGIN_BOTTOM,
	CHART_TOOLTIP_STYLE,
	formatMetricValue,
	getFormatter,
	getMetricColor,
	LIGHTHOUSE_CONFIG,
	METRIC_THRESHOLDS,
} from "./PerformanceUtils";

/**
 * Properties for the MetricDetailChart component.
 */
interface MetricDetailChartProps {
	/** The name of the performance metric to display (e.g., `LCP`). */
	metric: string;
	/** The transformed timeseries data points. */
	chartData: ChartDataPoint[];
	/** A list of app version change events for reference lines. */
	versionChanges: { timestamp: number; version: string }[];
	/** The active user locale for date formatting. */
	locale: string;
}

/**
 * Renders a detailed composed chart for a single performance metric.
 *
 * @remarks
 * This component uses a `ComposedChart` to display:
 * 1. A `Bar` representing the range between the 50th and 90th percentiles.
 * 2. A `Line` representing the 75th percentile trend.
 * 3. `ReferenceLine` markers for application version changes.
 *
 * Values are logically clamped to a metric-specific threshold (from `METRIC_THRESHOLDS`)
 * to maintain visual resolution, while the original values are preserved in tooltips.
 *
 * @param {MetricDetailChartProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered detail chart.
 *
 * @see {@link getMetricColor}
 * @see {@link METRIC_THRESHOLDS}
 * @see {@link ChartDataPoint}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MetricDetailChart
 *   metric="LCP"
 *   chartData={data}
 *   versionChanges={versions}
 *   recharts={recharts}
 *   locale="en-US"
 * />
 * ```
 */
export const MetricDetailChart: FC<MetricDetailChartProps> = ({
	metric,
	chartData,
	versionChanges,
	locale,
}) => {
	const config = LIGHTHOUSE_CONFIG[metric] || { p90: 2500, p50: 4000 };

	const color = getMetricColor(metric, 11);
	const p75Key = `${metric}_p75`;
	const rangeKey = `${metric}_range`;
	const threshold = METRIC_THRESHOLDS[metric] || 10000;

	// Process data to clamp the visual range but keep original for tooltip
	const clampedData = chartData.map((p) => {
		const range = p[rangeKey] as [number, number] | undefined;
		const p75 = p[p75Key] as number | undefined;

		return {
			...p,
			range_clamped: range ? [range[0], Math.min(range[1], threshold)] : undefined,
			p75_clamped: p75 !== undefined ? Math.min(p75, threshold) : undefined,
		};
	});

	return (
		<div style={{ height: CHART_HEIGHT, marginBottom: CHART_MARGIN_BOTTOM }}>
			<ResponsiveContainer width="100%" height="100%">
				<ComposedChart
					data={clampedData}
					margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-5)" />

					{/* Background Threshold Shading: Highlight the 'Good' zone using the metric's theme color */}
					<ReferenceArea
						y1={0}
						y2={config.p90}
						fill={getMetricColor(metric, "a4")}
						stroke="none"
					/>
					<ReferenceLine
						y={config.p90}
						stroke={getMetricColor(metric, "a7")}
						strokeWidth={1}
					/>

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
						tickFormatter={(val: number) => {
							const dateObj = new Date(val);

							return getFormatter(locale, {
								month: "numeric",
								day: "numeric",
							}).format(dateObj);
						}}
					/>

					<YAxis
						axisLine={false}
						tickLine={false}
						width={40}
						domain={[0, threshold]}
						tick={{ fill: "var(--gray-11)", fontSize: 11, fontWeight: 500 }}
					/>

					<Tooltip
						isAnimationActive={false}
						content={({ active, payload, label: _label }) => {
							if (active && payload && payload.length) {
								const item = payload[0].payload as ChartDataPoint;
								const format = (v: number) => formatMetricValue(metric, v);

								const p50 = item[`${metric}_p50`] as number | undefined;
								const p75 = item[`${metric}_p75`] as number | undefined;
								const p90 = item[`${metric}_p90`] as number | undefined;

								return (
									<Flex direction="column" gap="1" style={CHART_TOOLTIP_STYLE}>
										<Text size="1" color="gray" mb="1">
											{item.displayDate} {item.hour}
											{item.appVersion ? ` (${item.appVersion})` : ""}
										</Text>
										{p90 !== undefined && (
											<Flex justify="between" gap="4">
												<Text color="gray">p90</Text>
												<Text weight="bold" style={{ color }}>
													{p90 > threshold
														? `>${format(threshold)}`
														: format(p90)}
												</Text>
											</Flex>
										)}
										{p75 !== undefined && (
											<Flex justify="between" gap="4">
												<Text color="gray">p75</Text>
												<Text weight="bold" style={{ color }}>
													{p75 > threshold
														? `>${format(threshold)}`
														: format(p75)}
												</Text>
											</Flex>
										)}
										{p50 !== undefined && (
											<Flex justify="between" gap="4">
												<Text color="gray">p50</Text>
												<Text weight="bold" style={{ color }}>
													{format(p50)}
												</Text>
											</Flex>
										)}
									</Flex>
								);
							}

							return null;
						}}
					/>

					<Bar
						dataKey="range_clamped"
						fill={color}
						fillOpacity={0.2}
						radius={[2, 2, 2, 2]}
						barSize={12}
					/>

					<Line
						type="basis"
						dataKey={`${metric}_p75_sma`}
						stroke={color}
						strokeWidth={3}
						dot={false}
						activeDot={{ r: 4 }}
						connectNulls
					/>
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
};
