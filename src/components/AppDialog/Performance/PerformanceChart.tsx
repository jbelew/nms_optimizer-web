import { FC, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Card, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { PerformanceMetric } from "@/hooks/usePerformanceData/usePerformanceData";

import { MetricDetailChart } from "./MetricDetailChart";
import { ChartDataPoint } from "./PerformanceTypes";
import {
	calculateSMA,
	computeLogNormalScore,
	getFormatter,
	getMetricColor,
	getStatusColor,
	LIGHTHOUSE_CONFIG,
} from "./PerformanceUtils";

/**
 * Properties for the {@link PerformanceChart} component.
 *
 * @remarks
 * This interface defines the data and library dependencies required to render
 * the performance timeseries charts. It uses dynamic imports for `recharts`
 * to support code-splitting.
 *
 * @see {@link PerformanceChart}
 * @see {@link PerformanceMetric}
 */
interface PerformanceChartProps {
	/**
	 * Raw performance metric records fetched from the API.
	 * @see {@link PerformanceMetric}
	 */
	data: PerformanceMetric[];
	/**
	 * The dynamic Recharts library module.
	 * Required because Recharts is loaded lazily to reduce initial bundle size.
	 */
	recharts: typeof import("recharts");
}

/**
 * Main chart and card renderer for the performance dashboard.
 *
 * @remarks
 * This component manages the high-level dashboard state and orchestration:
 * - Data transformation: Converts flat API records into timestamp-keyed timeseries.
 * - Score Calculation: Computes a weighted overall performance score using Lighthouse logic.
 * - Interaction: Handles metric selection, view switching, and trend analysis.
 *
 * It renders a responsive grid of summary cards for each metric, followed by either:
 * 1. An aggregate stacked `AreaChart` (when no metric is selected).
 * 2. A detailed `MetricDetailChart` for the specific selected metric.
 *
 * @param {PerformanceChartProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered performance dashboard UI.
 *
 * @see {@link MetricDetailChart}
 * @see {@link computeLogNormalScore}
 * @see {@link PerformanceMetric}
 * @see {@link LIGHTHOUSE_CONFIG}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * import * as recharts from 'recharts';
 *
 * // Renders the dashboard with raw data and Recharts dependency
 * <PerformanceChart
 *   data={apiPerformanceData}
 *   recharts={recharts}
 * />
 * ```
 */
export const PerformanceChart: FC<PerformanceChartProps> = ({ data, recharts }) => {
	const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
	const {
		ResponsiveContainer,
		AreaChart,
		Area,
		XAxis,
		YAxis,
		CartesianGrid,
		Tooltip,
		ReferenceLine,
		Label,
	} = recharts;

	const { i18n } = useTranslation();
	const locale = i18n.language;

	const isDesktop = useBreakpoint("640px");
	const maxPoints = isDesktop ? 48 : 24;

	/**
	 * Transforms flat API records into a timestamp-keyed structure for Recharts.
	 *
	 * @remarks
	 * This transformation performs several key operations:
	 * 1. Groups individual metric records by their `timestamp`.
	 * 2. Formats dates and hours according to the current `locale`.
	 * 3. Extracts unique metric names (excluding 'TBT').
	 * 4. Normalizes data points to ensure all metrics have at least an `undefined` value
	 *    to prevent rendering gaps.
	 * 5. Applies a minimum visual height (80ms) for stacked aggregate charts to ensure
	 *    visibility of small values while preserving original values for tooltips.
	 *
	 * @param {PerformanceMetric[]} raw - The raw array of metric records from the API.
	 *
	 * @returns {{ chartData: ChartDataPoint[], uniqueMetrics: string[] }} The transformed
	 * timeseries data and the list of active metrics.
	 *
	 * @see {@link ChartDataPoint}
	 * @see {@link getFormatter}
	 *
	 * @example
	 * ```ts
	 * const { chartData, uniqueMetrics } = transformData(apiMetrics);
	 * // returns { chartData: [...], uniqueMetrics: ["FCP", "LCP", ...] }
	 * ```
	 */
	const transformData = (raw: PerformanceMetric[]) => {
		const dateMap: Record<number, ChartDataPoint> = {};
		const metrics = new Set<string>();

		const dateFormatter = getFormatter(locale, {
			month: "numeric",
			day: "numeric",
		});
		const hourFormatter = getFormatter(locale, {
			hour: "numeric",
			minute: "numeric",
		});

		raw.forEach((item) => {
			if (item.metric_name === "TBT") return;

			const dateObj = new Date(item.timestamp);
			const formattedDate = dateFormatter.format(dateObj);
			const formattedHour = hourFormatter.format(dateObj);

			if (!dateMap[item.timestamp]) {
				dateMap[item.timestamp] = {
					timestamp: item.timestamp,
					displayDate: formattedDate,
					hour: formattedHour,
					appVersion: item.app_version,
				};
			}

			dateMap[item.timestamp][item.metric_name] = item.average_value;
			if (item.p50 !== undefined)
				dateMap[item.timestamp][`${item.metric_name}_p50`] = item.p50;
			if (item.p75 !== undefined)
				dateMap[item.timestamp][`${item.metric_name}_p75`] = item.p75;
			if (item.p90 !== undefined)
				dateMap[item.timestamp][`${item.metric_name}_p90`] = item.p90;

			if (item.p50 !== undefined && item.p90 !== undefined) {
				dateMap[item.timestamp][`${item.metric_name}_range`] = [item.p50, item.p90];
			}

			metrics.add(item.metric_name);
		});

		const fullChartData = Object.values(dateMap)
			.sort((a, b) => a.timestamp - b.timestamp)
			.map((point) => {
				const normalizedPoint = { ...point };
				metrics.forEach((m) => {
					if (normalizedPoint[m] === undefined) {
						normalizedPoint[m] = undefined;
					} else {
						const originalValue = normalizedPoint[m] as number;
						normalizedPoint[`${m}_original`] = originalValue;
						// Minimum visual height for aggregate stacked chart
						normalizedPoint[m] = Math.max(originalValue, 80);
					}

					[`${m}_p50`, `${m}_p75`, `${m}_p90`, `${m}_range`].forEach((pKey) => {
						if (normalizedPoint[pKey] === undefined) normalizedPoint[pKey] = undefined;
					});
				});

				return normalizedPoint;
			});

		// Sub-sample if we have too many points to maintain readability and performance
		let chartData = fullChartData;

		if (fullChartData.length > maxPoints) {
			const sampledData: ChartDataPoint[] = [];
			const step = (fullChartData.length - 1) / (maxPoints - 1);

			for (let i = 0; i < maxPoints; i++) {
				// Rounding ensures we pick a point as close as possible to the step interval,
				// and ensures the first (i=0) and last (i=maxPoints-1) points are always included.
				const index = Math.round(i * step);
				sampledData.push(fullChartData[index]);
			}

			chartData = sampledData;
		}

		// Calculate 5-point Simple Moving Average (SMA) for all metrics
		// This is done after sub-sampling so the SMA reflects the visual trend
		metrics.forEach((m) => {
			const p75Values = chartData.map((p) => p[`${m}_p75`] as number | undefined);
			const p75SmaValues = calculateSMA(p75Values, 5);

			const mainValues = chartData.map((p) => p[`${m}_original`] as number | undefined);
			const mainSmaValues = calculateSMA(mainValues, 5);

			chartData.forEach((p, i) => {
				p[`${m}_p75_sma`] = p75SmaValues[i];
				p[`${m}_sma`] = mainSmaValues[i];
			});
		});

		return { chartData, uniqueMetrics: Array.from(metrics) };
	};

	const { chartData, uniqueMetrics } = transformData(data);

	const versionChanges: { timestamp: number; version: string }[] = [];
	let lastVersion: string | null = null;
	chartData.forEach((point) => {
		if (lastVersion && point.appVersion !== lastVersion) {
			versionChanges.push({ timestamp: point.timestamp, version: point.appVersion });
		}

		lastVersion = point.appVersion;
	});

	const displayOrder = ["TTFB", "FCP", "LCP", "CLS", "INP"];
	const activeMetrics = displayOrder.filter((m) => uniqueMetrics.includes(m));
	const stackOrder = ["TTFB", "FCP", "LCP", "CLS", "INP"].filter((m) =>
		uniqueMetrics.includes(m)
	);

	/**
	 * Retrieves the most recent value for a metric from the timeseries.
	 *
	 * @remarks
	 * Iterates backwards through the `chartData` to find the latest non-null value
	 * for the specified metric. It prioritizes the `_original` value if available
	 * (which avoids the visual normalization used for stacked charts).
	 *
	 * @param {string} metric - The name of the metric (e.g., "LCP", "FCP").
	 *
	 * @returns {number | null} The latest numeric value or null if not found.
	 *
	 * @example
	 * ```ts
	 * const latestLCP = getLatestValue("LCP");
	 * // returns 1250 (in ms)
	 * ```
	 */
	const getLatestValue = (metric: string): number | null => {
		for (let i = chartData.length - 1; i >= 0; i--) {
			const originalVal = chartData[i][`${metric}_original`];
			const val =
				originalVal !== undefined
					? (originalVal as number)
					: (chartData[i][metric] as number);
			if (val !== undefined && val !== null) return val;
		}

		return null;
	};

	/**
	 * Determines the trend direction between the two most recent data points.
	 *
	 * @remarks
	 * Compares the latest value with the previous one in the timeseries.
	 * - `improvement`: The value has decreased (better performance).
	 * - `regression`: The value has increased (worse performance).
	 * - `neutral`: No change or insufficient data.
	 *
	 * @param {string} metric - The name of the metric to analyze.
	 *
	 * @returns {"improvement" | "regression" | "neutral"} The trend status.
	 *
	 * @example
	 * ```ts
	 * const trend = getMetricTrend("FCP");
	 * // returns "improvement"
	 * ```
	 */
	const getMetricTrend = (metric: string): "improvement" | "regression" | "neutral" => {
		const values: number[] = [];

		for (let i = chartData.length - 1; i >= 0; i--) {
			const originalVal = chartData[i][`${metric}_original`];
			const val =
				originalVal !== undefined
					? (originalVal as number)
					: (chartData[i][metric] as number);
			if (val !== undefined && val !== null) values.push(val);
			if (values.length === 2) break;
		}

		if (values.length < 2) return "neutral";

		return values[0] < values[1]
			? "improvement"
			: values[0] > values[1]
				? "regression"
				: "neutral";
	};

	/**
	 * Computes the weighted overall performance score.
	 *
	 * @remarks
	 * Calculates the score by:
	 * 1. Fetching the latest value for each active metric.
	 * 2. Computing the log-normal score for each value using `computeLogNormalScore`.
	 * 3. Applying weights defined in `LIGHTHOUSE_CONFIG`.
	 * 4. Returning a weighted average (0-100).
	 *
	 * @returns {number | null} The overall score or null if no metrics are available.
	 *
	 * @see {@link computeLogNormalScore}
	 * @see {@link LIGHTHOUSE_CONFIG}
	 *
	 * @example
	 * ```ts
	 * const score = calculateOverallScore();
	 * // returns 92
	 * ```
	 */
	const calculateOverallScore = () => {
		let totalWeight = 0,
			totalScore = 0;
		activeMetrics.forEach((m) => {
			const val = getLatestValue(m);
			const metricConfig = LIGHTHOUSE_CONFIG[m];

			if (val !== null && metricConfig) {
				totalScore +=
					computeLogNormalScore(val, metricConfig.p90, metricConfig.p50) *
					metricConfig.weight;
				totalWeight += metricConfig.weight;
			}
		});

		return totalWeight > 0 ? Math.round(totalScore / totalWeight) : null;
	};

	const overallScore = calculateOverallScore();

	/**
	 * Determines the overall trend by averaging individual metric trends.
	 *
	 * @remarks
	 * This heuristic counts the number of improvements vs regressions across all
	 * active metrics. The majority trend is returned. If they are equal or
	 * zero, it returns `neutral`.
	 *
	 * @returns {"improvement" | "regression" | "neutral"} The overall aggregate trend.
	 *
	 * @example
	 * ```ts
	 * const status = getOverallTrend();
	 * // returns "improvement"
	 * ```
	 */
	const getOverallTrend = (): "improvement" | "regression" | "neutral" => {
		let improvementCount = 0;
		let regressionCount = 0;

		activeMetrics.forEach((m) => {
			const trend = getMetricTrend(m);
			if (trend === "improvement") improvementCount++;
			else if (trend === "regression") regressionCount++;
		});

		if (improvementCount > regressionCount) return "improvement";
		if (regressionCount > improvementCount) return "regression";

		return "neutral";
	};

	const overallTrend = getOverallTrend();

	return (
		<Flex mt="1" mb="1" mr="1" ml="1" direction="column" gap="4">
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
					const val = getLatestValue(metric);
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
										{val !== null
											? metric === "CLS"
												? (val / 1000).toFixed(2)
												: Math.round(val)
											: "—"}
										<Text size="1" ml="1">
											{metric === "CLS" ? "" : "ms"}
										</Text>
									</Text>
									{getMetricTrend(metric) === "improvement" && (
										<Text color="green">
											<ArrowDownIcon />
										</Text>
									)}
									{getMetricTrend(metric) === "regression" && (
										<Text color="red">
											<ArrowUpIcon />
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
					recharts={recharts}
					locale={locale}
				/>
			) : (
				<ResponsiveContainer width="100%" height={350}>
					<AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="var(--gray-5)"
						/>
						{versionChanges.map((change) => (
							<ReferenceLine
								key={change.timestamp}
								x={change.timestamp}
								stroke="var(--gray-8)"
								strokeDasharray="3 3"
								strokeWidth={1}
							>
								<Label
									value={
										change.version.startsWith("v")
											? change.version
											: `v${change.version}`
									}
									position="insideTopLeft"
									fill="var(--gray-11)"
									fontSize={11}
									fontWeight={500}
									offset={5}
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
									name === "CLS"
										? (numericValue / 1000).toFixed(2)
										: `${Math.round(numericValue)}ms`,
									String(name),
								];
							}}
							contentStyle={{
								backgroundColor: "var(--gray-3)",
								borderColor: "var(--gray-6)",
								borderRadius: "8px",
								color: "var(--gray-12)",
								fontSize: "12px",
								fontWeight: 500,
							}}
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
			)}
		</Flex>
	);
};
