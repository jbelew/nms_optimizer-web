import { FC, lazy, Suspense, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Card, Flex, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { PerformanceMetric } from "@/hooks/usePerformanceData/usePerformanceData";

import {
	calculateOverallPerformanceScore,
	CHART_HEIGHT,
	CHART_MARGIN_BOTTOM,
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

const PerformanceChartsContainer = lazy(() => import("./PerformanceChartsContainer"));

/**
 * Properties for the {@link PerformanceChart} component.
 *
 * @remarks
 * This interface defines the data required to render the performance timeseries charts.
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
 * @see {@link PerformanceChartsContainer}
 * @see {@link import("./PerformanceUtils").computeLogNormalScore}
 * @see {@link PerformanceMetric}
 * @see {@link import("./PerformanceUtils").LIGHTHOUSE_CONFIG}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * // Mounts the performance chart with raw metric data
 * <PerformanceChart data={apiResponseData} />
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

			<Suspense
				fallback={
					<Skeleton
						height={`${CHART_HEIGHT}px`}
						width="100%"
						style={{ marginBottom: CHART_MARGIN_BOTTOM }}
					/>
				}
			>
				<PerformanceChartsContainer
					selectedMetric={selectedMetric}
					chartData={chartData}
					uniqueMetrics={uniqueMetrics}
					versionChanges={versionChanges}
					locale={locale}
				/>
			</Suspense>
		</Flex>
	);
};
