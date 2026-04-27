import { FC, Suspense, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Card, Flex, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import {
	PerformanceMetric,
	usePerformanceData,
} from "@/hooks/usePerformanceData/usePerformanceData";
import { fetchPerformanceData } from "@/utils/api/performanceResource";

/**
 * Represents a single point in the timeseries chart.
 *
 * @remarks
 * Includes metadata for display (date, hour) and dynamic metric keys
 * (e.g., `LCP`, `FCP`) used by the stacked Area components. These keys
 * are dynamically mapped from the incoming API payload.
 *
 * @see {@link PerformanceMetric}
 *
 * @category Interfaces
 */
interface ChartDataPoint {
	/** Unix timestamp in milliseconds for consistent sorting. */
	timestamp: number;
	/** Localized formatted MM/DD string for X-axis display. */
	displayDate: string;
	/** Localized formatted hour string (e.g., "5 PM") for tooltip display. */
	hour: string;
	/** The application version for this data point. */
	appVersion: string;
	/** Dynamic performance metric values indexed by their names. */
	[metricName: string]: string | number;
}

/**
 * Internal chart renderer.
 *
 * @remarks
 * Renders the responsive performance chart and metric summary cards. Data is transformed
 * internally from the flat payload into a timestamp-keyed structure required by Recharts.
 *
 * @param {Object} props - Component properties.
 * @param {PerformanceMetric[]} props.data - Raw performance metrics from the API.
 * @param {typeof import("recharts")} props.recharts - The loaded Recharts library.
 *
 * @returns {JSX.Element} The rendered chart and cards.
 *
 * @example
 * ```tsx
 * // Internal usage by LazyChartLoader
 * <PerformanceChart data={data} recharts={recharts} />
 * ```
 */
const PerformanceChart: FC<{ data: PerformanceMetric[]; recharts: typeof import("recharts") }> = ({
	data,
	recharts,
}) => {
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

	// Transform flat data into timeseries format
	const transformData = (raw: PerformanceMetric[]) => {
		const dateMap: Record<number, ChartDataPoint> = {};
		const metrics = new Set<string>();

		raw.forEach((item) => {
			if (item.metric_name === "TBT") return; // Skip TBT early

			const dateObj = new Date(item.timestamp);

			const formattedDate = new Intl.DateTimeFormat(locale, {
				month: "numeric",
				day: "numeric",
			}).format(dateObj);

			const formattedHour = new Intl.DateTimeFormat(locale, {
				hour: "numeric",
				minute: "numeric",
			}).format(dateObj);

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
			metrics.add(item.metric_name);
		});

		const chartData = Object.values(dateMap)
			.sort((a, b) => a.timestamp - b.timestamp)
			.map((point) => {
				const normalizedPoint = { ...point };
				metrics.forEach((m) => {
					if (normalizedPoint[m] === undefined) {
						normalizedPoint[m] = null as unknown as number;
					} else if (normalizedPoint[m] !== null) {
						const originalValue = normalizedPoint[m] as number;
						normalizedPoint[`${m}_original`] = originalValue;
						// Ensure a minimum visual thickness for 0 or near-0 values for aggregate chart
						normalizedPoint[m] = Math.max(originalValue, 80);
					}

					// Also ensure percentiles are present or null
					[`${m}_p50`, `${m}_p75`, `${m}_p90`].forEach((pKey) => {
						if (normalizedPoint[pKey] === undefined) {
							normalizedPoint[pKey] = null as unknown as number;
						}
					});
				});

				return normalizedPoint;
			});

		return {
			chartData,
			uniqueMetrics: Array.from(metrics),
		};
	};

	const { chartData, uniqueMetrics } = transformData(data);

	// Identify version change points for vertical markers
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

	const getMetricColor = (name: string, weight: 10 | 11 = 10) => {
		const base = (() => {
			switch (name) {
				case "TTFB":
					return "cyan";
				case "FCP":
					return "purple";
				case "LCP":
					return "red";
				case "CLS":
					return "orange";
				case "INP":
					return "amber";
				default:
					return "accent";
			}
		})();

		return `var(--${base}-${weight})`;
	};

	const getStatusColor = (metric: string, value: number | string | undefined | null) => {
		if (value === undefined || value === null || typeof value === "string")
			return "var(--gray-11)";

		switch (metric) {
			case "LCP":
				return value <= 2500
					? "var(--green-11)"
					: value <= 4000
						? "var(--amber-11)"
						: "var(--red-11)";
			case "INP":
				return value <= 200
					? "var(--green-11)"
					: value <= 500
						? "var(--amber-11)"
						: "var(--red-11)";
			case "CLS":
				return value <= 100
					? "var(--green-11)"
					: value <= 250
						? "var(--amber-11)"
						: "var(--red-11)";
			case "FCP":
				return value <= 1800
					? "var(--green-11)"
					: value <= 3000
						? "var(--amber-11)"
						: "var(--red-11)";
			case "TTFB":
				return value <= 800
					? "var(--green-11)"
					: value <= 1800
						? "var(--amber-11)"
						: "var(--red-11)";
			default:
				return "var(--gray-11)";
		}
	};

	const getLatestValue = (metric: string): number | null => {
		for (let i = chartData.length - 1; i >= 0; i--) {
			const originalVal = chartData[i][`${metric}_original`];
			const val = originalVal !== undefined ? originalVal : chartData[i][metric];

			if (val !== null && typeof val === "number") {
				return val;
			}
		}

		return null;
	};

	/**
	 * Determines the trend of a metric compared to its previous data point.
	 *
	 * @param {string} metric - The name of the metric to analyze.
	 *
	 * @returns {"improvement" | "regression" | "neutral"} The trend status.
	 *
	 * @example
	 * ```ts
	 * const trend = getMetricTrend("LCP"); // returns "improvement", "regression", or "neutral"
	 * ```
	 */
	const getMetricTrend = (metric: string): "improvement" | "regression" | "neutral" => {
		const values: number[] = [];

		for (let i = chartData.length - 1; i >= 0; i--) {
			const originalVal = chartData[i][`${metric}_original`];
			const val = originalVal !== undefined ? originalVal : chartData[i][metric];

			if (val !== null && typeof val === "number") {
				values.push(val);
			}

			if (values.length === 2) break;
		}

		if (values.length < 2) {
			return "neutral";
		}

		const latest = values[0];
		const previous = values[1];

		// For current metrics (LCP, FCP, INP, TTFB, CLS), lower is always better
		if (latest < previous) {
			return "improvement";
		}

		if (latest > previous) {
			return "regression";
		}

		return "neutral";
	};

	return (
		<Flex direction="column" gap="4">
			<Flex gap="3" wrap="wrap" justify="between">
				{activeMetrics.map((metric) => {
					const val = getLatestValue(metric);
					const color = getStatusColor(metric, val ?? undefined);
					const trend = getMetricTrend(metric);
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
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setSelectedMetric(isSelected ? null : metric);
								}
							}}
							role="button"
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
									<Text size="5" weight="medium" style={{ color }}>
										{val !== null
											? metric === "CLS"
												? (val / 1000).toFixed(2)
												: Math.round(val)
											: "—"}
										<Text size="1" ml="1">
											{metric === "CLS" ? "" : "ms"}
										</Text>
									</Text>

									{trend === "improvement" && (
										<Text color="green">
											<ArrowDownIcon />
										</Text>
									)}

									{trend === "regression" && (
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

			<ResponsiveContainer width="100%" height={350}>
				<AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-5)" />

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
						tickFormatter={(val: number) => {
							const dateObj = new Date(val);

							return new Intl.DateTimeFormat(locale, {
								month: "numeric",
								day: "numeric",
							}).format(dateObj);
						}}
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
							value: number | string | ReadonlyArray<number | string> | undefined,
							name: string | number | undefined,
							props: { payload?: Record<string, unknown> }
						) => {
							const originalValue = props.payload
								? props.payload[`${name}_original`]
								: undefined;
							const numericValue =
								typeof originalValue === "number"
									? originalValue
									: typeof value === "number"
										? value
										: 0;
							const formattedValue =
								name === "CLS"
									? (numericValue / 1000).toFixed(2)
									: `${Math.round(numericValue)}ms`;

							return [formattedValue, String(name || "")];
						}}
						contentStyle={{
							backgroundColor: "var(--gray-2)",
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
							type="monotone"
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
		</Flex>
	);
};

/**
 * Lazily loaded Recharts library wrapper.
 * @example
 * ```tsx
 * <LazyChartLoader data={data} />
 * ```
 */
const LazyChartLoader: FC<{ data: PerformanceMetric[] }> = ({ data }) => {
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
 * This component triggers the API fetch via `fetchPerformanceData` when the
 * dialog is opened and consumes the result using the `usePerformanceData` hook.
 * It handles the loading state via `<Suspense>` and error boundaries in its parent.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Whether the performance dialog is visible.
 *
 * @returns {JSX.Element} The rendered performance cards and chart.
 *
 * @see {@link fetchPerformanceData}
 * @see {@link usePerformanceData}
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

	// Trigger fetching when open. fetchPerformanceData handles its own promise stability.
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
