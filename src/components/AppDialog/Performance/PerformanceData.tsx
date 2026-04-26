import { FC, lazy, ReactNode, Suspense } from "react";
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
 * Lazily loaded Recharts line chart component.
 *
 * @remarks
 * This internal component encapsulates all Recharts logic to isolate the charting
 * library from the main application bundle. It handles data transformation,
 * localization of timestamps, and the rendering of the stacked area visualization.
 *
 * @component
 *
 * @category Components
 *
 * @internal
 */
const LazyPerformanceChart = lazy(async () => {
	const {
		ResponsiveContainer,
		AreaChart,
		Area,
		XAxis,
		YAxis,
		CartesianGrid,
		Tooltip,
		Legend,
		ReferenceLine,
		Label,
	} = await import("recharts");

	/**
	 * Internal chart renderer.
	 *
	 * @remarks
	 * Renders the responsive performance chart and metric summary cards. Data is transformed
	 * internally from the flat payload into a timestamp-keyed structure required by Recharts.
	 *
	 * @param {Object} props - Component properties.
	 * @param {PerformanceMetric[]} props.data - Raw performance metrics from the API.
	 *
	 * @returns {JSX.Element} The rendered chart and cards.
	 *
	 * @component
	 *
	 * @example
	 * ```tsx
	 * <PerformanceChart data={data} />
	 * ```
	 */
	const PerformanceChart: FC<{ data: PerformanceMetric[] }> = ({ data }) => {
		const { i18n } = useTranslation();
		const locale = i18n.language;

		// Transform flat data into timeseries format
		const transformData = (raw: PerformanceMetric[]) => {
			const dateMap: Record<number, ChartDataPoint> = {};
			const metrics = new Set<string>();

			raw.forEach((item) => {
				if (item.metric_name === "CLS") return; // Skip CLS early

				// item.timestamp is now Unix millis from the API
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
				metrics.add(item.metric_name);
			});

			const chartData = Object.values(dateMap)
				.sort((a, b) => a.timestamp - b.timestamp)
				.map((point) => {
					const normalizedPoint = { ...point };
					metrics.forEach((m) => {
						if (normalizedPoint[m] === undefined) {
							normalizedPoint[m] = null as unknown as number; // Use null to prevent 0-value plotting
						}
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

		// Define explicit orders for consistent rendering
		// Visual/Legend/Card order (Top to Bottom / Left to Right)
		const displayOrder = ["TTFB", "TBT", "INP", "FCP", "LCP"];
		const activeMetrics = displayOrder.filter((m) => uniqueMetrics.includes(m));

		// Stacking order (Bottom of chart to Top)
		// Recharts AreaChart stacks from first child (bottom) to last child (top)
		const stackOrder = ["LCP", "FCP", "INP", "TBT", "TTFB"].filter((m) =>
			uniqueMetrics.includes(m)
		);

		/**
		 * Identifies high-contrast colors for each Web Vital category.
		 *
		 * @remarks
		 * Maps each core metric (LCP, FCP, INP, etc.) to a consistent Radix UI color scale
		 * for visual identification across charts and legends.
		 *
		 * @param {string} name - The performance metric name (e.g., "LCP", "INP").
		 * @param {9 | 11} [weight=9] - The Radix color scale weight to use.
		 *
		 * @returns {string} The CSS variable representing the Radix color.
		 *
		 * @default {weight: 9}
		 *
		 * @example
		 * ```ts
		 * getMetricColor("LCP", 11); // returns "var(--iris-11)"
		 * ```
		 */
		const getMetricColor = (name: string, weight: 9 | 11 = 9) => {
			const base = (() => {
				switch (name) {
					case "LCP":
						return "iris";
					case "FCP":
						return "purple";
					case "INP":
						return "crimson";
					case "TBT":
						return "orange";
					case "TTFB":
						return "amber";
					default:
						return "accent";
				}
			})();

			return `var(--${base}-${weight})`;
		};

		/**
		 * Calculates traffic-light status colors based on Google's p75 thresholds.
		 *
		 * @remarks
		 * Uses Web Vitals baseline thresholds to return green, amber, or red CSS color variables.
		 *
		 * @param {string} metric - The performance metric name.
		 * @param {number|string|undefined} value - The actual metric value to evaluate.
		 *
		 * @returns {string} The CSS variable for the status color (green, amber, or red).
		 *
		 * @example
		 * ```ts
		 * getStatusColor("LCP", 2600); // returns "var(--amber-11)"
		 * ```
		 */
		const getStatusColor = (metric: string, value: number | string | undefined) => {
			if (!value || typeof value === "string") return "var(--gray-11)";

			switch (metric) {
				case "LCP":
					return value <= 2500
						? "var(--green-11)"
						: value <= 4000
							? "var(--amber-11)"
							: "var(--red-11)";
				case "INP":
				case "TBT":
					return value <= 200
						? "var(--green-11)"
						: value <= 500
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

		/**
		 * Finds the latest non-null value for a given metric across the entire dataset.
		 *
		 * @remarks
		 * Iterates backwards through the transformed chart data to find the most recent
		 * recorded value for a specific metric. Useful for summary cards where some metrics
		 * might be missing in the latest timestamp.
		 *
		 * @param {string} metric - The performance metric name.
		 *
		 * @returns {number | null} The latest value or null if not found.
		 *
		 * @example
		 * ```ts
		 * getLatestValue("LCP"); // returns 2450
		 * ```
		 */
		const getLatestValue = (metric: string): number | null => {
			for (let i = chartData.length - 1; i >= 0; i--) {
				const val = chartData[i][metric];

				if (val !== null && typeof val === "number") {
					return val;
				}
			}

			return null;
		};

		return (
			<Flex direction="column" gap="4">
				<Flex gap="3" wrap="wrap" justify="between">
					{activeMetrics.map((metric) => {
						const val = getLatestValue(metric);
						const color = getStatusColor(metric, val ?? undefined);

						return (
							<Card key={`stat-${metric}`} style={{ flex: "1 1 120px" }}>
								<Flex direction="column" align="center">
									<Text size="1" color="gray" weight="medium">
										{metric}
									</Text>

									<Text size="5" weight="medium" style={{ color }}>
										{val !== null ? Math.round(val) : "—"}
										<Text size="1" ml="1">
											ms
										</Text>
									</Text>
								</Flex>
							</Card>
						);
					})}
				</Flex>

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
									value={`v${change.version}`}
									position="insideTopLeft"
									fill="var(--gray-10)"
									fontSize={10}
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
								// Use a short month/day format for the automatically generated time ticks

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
							labelFormatter={(_label: ReactNode, payload) => {
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
								name: string | number | undefined
							) => {
								const numericValue = typeof value === "number" ? value : 0;

								return [`${Math.round(numericValue)}ms`, String(name || "")];
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

						<Legend
							content={() => (
								<Flex gap="4" justify="center" mt="2" wrap="wrap">
									{activeMetrics.map((metric) => (
										<Flex key={metric} align="center" gap="2">
											<div
												style={{
													width: "12px",
													height: "12px",
													backgroundColor: getMetricColor(metric, 11),
													borderRadius: "2px",
												}}
											/>

											<Text size="1" weight="medium" color="gray">
												{metric}
											</Text>
										</Flex>
									))}
								</Flex>
							)}
						/>

						{stackOrder.map((metric) => (
							<Area
								key={metric}
								type="monotone"
								dataKey={metric}
								stackId="1"
								stroke={getMetricColor(metric, 11)}
								fill={getMetricColor(metric, 9)}
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

	return { default: PerformanceChart };
});

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
	if (isOpen) {
		fetchPerformanceData();
	}

	const data = usePerformanceData();

	if (!data || data.length === 0) {
		return <Text>{t("dialogs.performance.noData", "No performance data available.")}</Text>;
	}

	return (
		<Flex direction="column" gap="4" style={{ overflow: "hidden" }}>
			<Suspense fallback={<Skeleton height="434px" width="100%" />}>
				<LazyPerformanceChart data={data} />
			</Suspense>
		</Flex>
	);
};

export default PerformanceData;
