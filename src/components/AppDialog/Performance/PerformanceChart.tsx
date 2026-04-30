import { FC, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Card, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
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

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { PerformanceMetric } from "@/hooks/usePerformanceData/usePerformanceData";

import { MetricDetailChart } from "./MetricDetailChart";
import { ChartDataPoint } from "./PerformanceTypes";
import {
	calculateOverallPerformanceScore,
	CHART_HEIGHT,
	CHART_MARGIN_BOTTOM,
	CHART_TOOLTIP_STYLE,
	formatMetricValue,
	getLatestMetricValue,
	getMetricColor,
	getMetricTrend,
	getOverallTrend,
	getStatusColor,
	getVersionChanges,
	METRIC_DISPLAY_ORDER,
	transformPerformanceData,
} from "./PerformanceUtils";

/**
 * Properties for the {@link PerformanceChart} component.
 */
interface PerformanceChartProps {
	/** Raw performance metric records fetched from the API. */
	data: PerformanceMetric[];
}

/**
 * Main dashboard renderer for performance statistics.
 *
 * @remarks
 * This component handles the high-level dashboard logic:
 * - Data transformation: Converts flat API records into timeseries.
 * - Score Calculation: Computes weighted overall performance.
 * - Interaction: Handles metric selection and view switching.
 *
 * It renders a responsive grid of summary cards followed by an aggregate
 * AreaChart or a detailed MetricDetailChart.
 *
 * @param {PerformanceChartProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered performance dashboard UI.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <PerformanceChart data={mockData} />
 * ```
 */
export const PerformanceChart: FC<PerformanceChartProps> = ({ data }) => {
	const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

	const { i18n } = useTranslation();
	const locale = i18n.language;

	const isDesktop = useBreakpoint("640px");
	const maxPoints = isDesktop ? 48 : 24;

	const { chartData, uniqueMetrics } = transformPerformanceData(data, locale, maxPoints);
	const versionChanges = getVersionChanges(chartData, maxPoints);

	const activeMetrics = METRIC_DISPLAY_ORDER.filter((m) => uniqueMetrics.includes(m));

	const overallScore = calculateOverallPerformanceScore(chartData, activeMetrics);
	const overallTrend = getOverallTrend(chartData, activeMetrics);

	return (
		<Flex direction="column" gap="4" style={{ width: "100%", flexGrow: 1, minWidth: 0 }}>
			<Flex gap="3" wrap="wrap" justify="between">
				{/* Overall Summary Toggle Card */}
				<Card
					style={{
						flex: "1 1 120px",
						cursor: "pointer",
						transition: "all 0.2s ease-in-out",
						border:
							selectedMetric === null
								? "2px solid var(--accent-11)"
								: "2px solid transparent",
						backgroundColor: selectedMetric === null ? "var(--gray-3)" : undefined,
					}}
					onClick={() => setSelectedMetric(null)}
					onKeyDown={(e) =>
						(e.key === "Enter" || e.key === " ") && setSelectedMetric(null)
					}
					role="button"
					aria-label="View overall performance summary"
					aria-pressed={selectedMetric === null}
					tabIndex={0}
				>
					<Flex direction="column" align="center">
						<Text size="1" weight="bold">
							OVERALL
						</Text>
						<Flex align="center" gap="1">
							<Text
								size="5"
								weight="medium"
								style={{
									color:
										overallScore !== null
											? overallScore >= 90
												? "var(--green-11)"
												: overallScore >= 50
													? "var(--amber-11)"
													: "var(--red-11)"
											: "var(--gray-11)",
								}}
							>
								{overallScore ?? "—"}
							</Text>
							{overallTrend === "improvement" && (
								<Text color="green">
									<ArrowUpIcon />
								</Text>
							)}
							{overallTrend === "regression" && (
								<Text color="red">
									<ArrowDownIcon />
								</Text>
							)}
						</Flex>
					</Flex>
				</Card>

				{activeMetrics.map((metric) => {
					const val = getLatestMetricValue(chartData, metric);
					const isSelected = selectedMetric === metric;

					return (
						<Card
							key={`stat-${metric}`}
							style={{
								flex: "1 1 120px",
								cursor: "pointer",
								transition: "all 0.2s ease-in-out",
								border: isSelected
									? `2px solid ${getMetricColor(metric, 11)}`
									: "2px solid transparent",
								backgroundColor: isSelected ? "var(--gray-3)" : undefined,
							}}
							onClick={() => setSelectedMetric(isSelected ? null : metric)}
							onKeyDown={(e) =>
								(e.key === "Enter" || e.key === " ") &&
								setSelectedMetric(isSelected ? null : metric)
							}
							role="button"
							aria-label={`View detailed ${metric} chart`}
							aria-pressed={isSelected}
							tabIndex={0}
						>
							<Flex direction="column" align="center">
								<Text
									size="1"
									weight="bold"
									style={{ color: getMetricColor(metric, 11) }}
								>
									{metric}
								</Text>
								<Flex align="center" gap="1">
									<Text
										size="5"
										weight="medium"
										style={{ color: getStatusColor(metric, val) }}
									>
										{val !== null ? formatMetricValue(metric, val) : "—"}
									</Text>
									{getMetricTrend(chartData, metric) === "improvement" && (
										<Text color="green">
											<ArrowDownIcon />
										</Text>
									)}
									{getMetricTrend(chartData, metric) === "regression" && (
										<Text color="red">
											<ArrowDownIcon />
										</Text>
									)}
								</Flex>
							</Flex>
						</Card>
					);
				})}
			</Flex>

			{selectedMetric ? (
				<MetricDetailChart
					metric={selectedMetric}
					chartData={chartData}
					versionChanges={versionChanges}
					locale={locale}
				/>
			) : (
				<div
					style={{
						height: CHART_HEIGHT,
						width: "100%",
						minWidth: 0,
						position: "relative",
						marginBottom: CHART_MARGIN_BOTTOM,
					}}
				>
					<ResponsiveContainer width="100%" height={CHART_HEIGHT} debounce={50}>
						<AreaChart
							data={chartData}
							margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="var(--gray-5)"
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
								formatter={(
									value,
									name,
									props: { payload?: Record<string, unknown> }
								) => {
									const originalValue = props.payload?.[`${name}_original`];
									const numericValue =
										typeof originalValue === "number"
											? originalValue
											: typeof value === "number"
												? value
												: 0;

									return [
										formatMetricValue(String(name), numericValue),
										String(name),
									];
								}}
								contentStyle={CHART_TOOLTIP_STYLE}
							/>
							{activeMetrics.map((metric) => (
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
			)}
		</Flex>
	);
};

export default PerformanceChart;
