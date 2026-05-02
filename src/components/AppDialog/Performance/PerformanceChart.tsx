import { FC, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Card, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
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

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { PerformanceMetric } from "@/hooks/usePerformanceData/usePerformanceData";

import { ChartDataPoint } from "./PerformanceTypes";
import {
	calculateOverallPerformanceScore,
	CHART_HEIGHT,
	CHART_MARGIN_BOTTOM,
	CHART_TOOLTIP_STYLE,
	formatMetricValue,
	getFormatter,
	getLatestMetricValue,
	getMetricColor,
	getMetricTrend,
	getOverallTrend,
	getStatusColor,
	getVersionChanges,
	LIGHTHOUSE_CONFIG,
	METRIC_DISPLAY_ORDER,
	METRIC_THRESHOLDS,
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
 * It renders a responsive grid of summary cards followed by a single,
 * dynamic ComposedChart that handles both aggregate and detail views.
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
	const maxPoints = isDesktop ? 168 : 72;

	const { chartData, uniqueMetrics } = transformPerformanceData(data, locale, maxPoints);
	const versionChanges = getVersionChanges(chartData, maxPoints);

	const activeMetrics = METRIC_DISPLAY_ORDER.filter((m) => uniqueMetrics.includes(m));

	const overallScore = calculateOverallPerformanceScore(chartData, activeMetrics);
	const overallTrend = getOverallTrend(chartData, activeMetrics);

	const yDomain = selectedMetric ? [0, METRIC_THRESHOLDS[selectedMetric] || 10000] : [0, 100];
	const selectedMetricConfig = selectedMetric ? LIGHTHOUSE_CONFIG[selectedMetric] : null;

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
					const trend = getMetricTrend(chartData, metric);

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
					<ComposedChart
						data={chartData}
						margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="var(--gray-5)"
						/>

						{/* Dynamic Background Threshold Bands */}
						{selectedMetric ? (
							<>
								{/* Detail View: Highlight the 'Good' zone */}
								<ReferenceArea
									y1={0}
									y2={selectedMetricConfig?.p90 || 1000}
									fill={getMetricColor(selectedMetric, "a4")}
									stroke="none"
								/>
								<ReferenceLine
									y={selectedMetricConfig?.p90 || 1000}
									stroke={getMetricColor(selectedMetric, "a7")}
									strokeWidth={1}
								/>
							</>
						) : (
							<>
								{/* Overall Ceiling: Success (90-100) and Needs Improvement (50-90) */}
								<ReferenceArea
									y1={90}
									y2={100}
									fill="var(--green-a4)"
									stroke="none"
								/>
								<ReferenceArea
									y1={50}
									y2={90}
									fill="var(--orange-a4)"
									stroke="none"
								/>

								{/* Metric Floor: Success (0-10) */}
								<ReferenceArea
									y1={0}
									y2={10}
									fill="var(--green-a4)"
									stroke="none"
								/>

								<ReferenceLine y={90} stroke="var(--green-a7)" strokeWidth={1} />
								<ReferenceLine y={50} stroke="var(--orange-a7)" strokeWidth={1} />
								<ReferenceLine y={10} stroke="var(--green-a7)" strokeWidth={1} />
							</>
						)}

						{versionChanges.map((change) => (
							<ReferenceLine
								key={change.timestamp}
								x={change.timestamp}
								stroke="var(--gray-9)"
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
									fill="var(--gray-11)"
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
							domain={yDomain}
							allowDataOverflow
							tick={{ fill: "var(--gray-11)", fontSize: 11, fontWeight: 500 }}
						/>

						<Tooltip
							wrapperStyle={{ pointerEvents: "none" }}
							allowEscapeViewBox={{ x: false, y: false }}
							isAnimationActive={false}
							offset={10}
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const item = payload[0].payload as ChartDataPoint;

									if (selectedMetric) {
										// Detailed Tooltip View
										const format = (v: number) =>
											formatMetricValue(selectedMetric, v);
										const p50 = item[`${selectedMetric}_p50`] as
											| number
											| undefined;
										const p75 = item[`${selectedMetric}_p75`] as
											| number
											| undefined;
										const p90 = item[`${selectedMetric}_p90`] as
											| number
											| undefined;
										const threshold =
											METRIC_THRESHOLDS[selectedMetric] || 10000;
										const color = getMetricColor(selectedMetric, 11);

										return (
											<Flex
												direction="column"
												gap="1"
												style={CHART_TOOLTIP_STYLE}
											>
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

									// Aggregate Tooltip View
									const score = item.overall_score_p75_sma as number | undefined;

									return (
										<Flex
											direction="column"
											gap="2"
											style={CHART_TOOLTIP_STYLE}
										>
											<Flex direction="column" gap="0">
												<Text size="1" color="gray">
													{item.displayDate} {item.hour}
													{item.appVersion ? ` (${item.appVersion})` : ""}
												</Text>
												<Flex align="center" gap="2">
													<Text
														size="3"
														weight="bold"
														style={{
															color:
																score !== undefined
																	? score >= 90
																		? "var(--green-11)"
																		: score >= 50
																			? "var(--amber-11)"
																			: "var(--red-11)"
																	: "var(--gray-11)",
														}}
													>
														{score !== undefined
															? Math.round(score)
															: "—"}
													</Text>
													<Text size="1" color="gray">
														OVERALL SCORE
													</Text>
												</Flex>
											</Flex>

											<Flex
												direction="column"
												gap="1"
												style={{
													borderTop: "1px solid var(--gray-5)",
													paddingTop: "4px",
												}}
											>
												{activeMetrics.map((m) => {
													const val = item[`${m}_original`] as
														| number
														| undefined;
													const mDeficit = item[`${m}_deficit`] as
														| number
														| undefined;
													const mScore =
														mDeficit !== undefined
															? 100 - mDeficit
															: undefined;

													return (
														<Flex
															key={m}
															justify="between"
															gap="4"
															align="center"
														>
															<Flex align="center" gap="2">
																<div
																	style={{
																		width: 8,
																		height: 8,
																		borderRadius: 2,
																		backgroundColor:
																			getMetricColor(m, 11),
																	}}
																/>
																<Text
																	size="1"
																	style={{
																		color: getMetricColor(
																			m,
																			11
																		),
																	}}
																>
																	{m}
																</Text>
															</Flex>
															<Flex align="center" gap="2">
																<Text size="1" weight="medium">
																	{val !== undefined
																		? formatMetricValue(m, val)
																		: "—"}
																</Text>
																<Text size="1" color="gray">
																	(
																	{mScore !== undefined
																		? Math.round(mScore)
																		: "—"}
																	)
																</Text>
															</Flex>
														</Flex>
													);
												})}
											</Flex>
										</Flex>
									);
								}

								return null;
							}}
						/>

						{/* Dynamic Range Bars */}
						{selectedMetric ? (
							<Bar
								key={`range-${selectedMetric}`}
								dataKey={`${selectedMetric}_range`}
								fill={getMetricColor(selectedMetric, 11)}
								fillOpacity={0.2}
								radius={[2, 2, 2, 2]}
								barSize={12}
							/>
						) : (
							<Bar
								key="overall-range"
								dataKey="overall_score_range"
								fill={getMetricColor("OVERALL", 11)}
								fillOpacity={0.2}
								radius={[2, 2, 2, 2]}
								barSize={12}
							/>
						)}

						{/* Individual Metric Lines (Morphed) */}
						{activeMetrics.map((m) => (
							<Line
								key={`metric-line-${m}`}
								type="monotone"
								dataKey={selectedMetric === m ? `${m}_p75_sma` : `${m}_deficit_sma`}
								stroke={getMetricColor(m, 11)}
								strokeWidth={selectedMetric === m ? 3 : 1.75}
								strokeOpacity={
									selectedMetric === null ? 1 : selectedMetric === m ? 1 : 0
								}
								dot={false}
								activeDot={selectedMetric === m ? { r: 4 } : false}
								connectNulls
								hide={selectedMetric !== null && selectedMetric !== m}
							/>
						))}

						{/* Overall Trend Line (Visible only in Aggregate View) */}
						<Line
							type="monotone"
							dataKey="overall_score_p75_sma"
							stroke={getMetricColor("OVERALL", 11)}
							strokeWidth={3}
							strokeOpacity={selectedMetric === null ? 1 : 0}
							dot={false}
							activeDot={{ r: 5 }}
							connectNulls
							hide={selectedMetric !== null}
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</div>
		</Flex>
	);
};

export default PerformanceChart;
