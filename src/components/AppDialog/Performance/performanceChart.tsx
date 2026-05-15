import {
	FC,
	KeyboardEvent,
	memo,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Card, Flex, SegmentedControl, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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

import { PerformanceMetric } from "@/hooks/usePerformanceData/usePerformanceData";

import { PerformanceDashboardLayout } from "./PerformanceLayout";
import { ChartDataPoint } from "./PerformanceTypes";
import {
	CHART_TOOLTIP_STYLE,
	formatMetricValue,
	getFormatter,
	getMetricColor,
	getStatusColor,
	getVersionChanges,
	LIGHTHOUSE_CONFIG,
	METRIC_DISPLAY_ORDER,
	METRIC_THRESHOLDS,
	PERFORMANCE_LAYOUT,
	transformPerformanceData,
} from "./PerformanceUtils";

const CHART_TICK_STYLE = { fill: "var(--gray-11)", fontSize: 11, fontWeight: 500 };
const ACTIVE_DOT_STYLE = { r: 4 };
const OVERALL_DOT_STYLE = { r: 5 };
const CHART_MARGIN = { bottom: 0, left: 0, right: 10, top: 10 };
const TOOLTIP_WRAPPER_STYLE = { pointerEvents: "none" as const };
const TOOLTIP_ALLOW_ESCAPE = { x: false, y: false };
const RESPONSIVE_CONTAINER_DEBOUNCE = 50;
const OVERALL_Y_DOMAIN: [number, number] = [0, 100];
const SCORE_BAND_COLOR = (score: number | undefined): string =>
	score === undefined
		? "var(--gray-11)"
		: score >= 90
			? "var(--green-11)"
			: score >= 50
				? "var(--amber-11)"
				: "var(--red-11)";

/**
 * Internal summary card used for both the OVERALL toggle and per-metric cards.
 *
 * @remarks
 * Encapsulates the shared Card structure, accessibility props (`role`,
 * `aria-pressed`, `tabIndex`), and keyboard activation behavior so styling
 * and a11y fixes stay consistent across all summary cards.
 */
interface MetricSummaryCardProps {
	ariaLabel: string;
	borderColor: string;
	children: ReactNode;
	isSelected: boolean;
	onActivate: () => void;
}

const MetricSummaryCard: FC<MetricSummaryCardProps> = ({
	ariaLabel,
	borderColor,
	children,
	isSelected,
	onActivate,
}) => {
	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onActivate();
		}
	};

	return (
		<Card
			aria-label={ariaLabel}
			aria-pressed={isSelected}
			onClick={onActivate}
			onKeyDown={handleKeyDown}
			role="button"
			style={{
				backgroundColor: isSelected ? "var(--gray-3)" : undefined,
				border: isSelected ? `2px solid ${borderColor}` : "2px solid transparent",
				cursor: "pointer",
				flex: "1 1 120px",
				transition: "all 0.2s ease-in-out",
			}}
			tabIndex={0}
		>
			<Flex align="center" direction="column">
				{children}
			</Flex>
		</Card>
	);
};

/**
 * Duration (ms) used for both Recharts line animations and the matching
 * detail↔detail morph window. The two MUST stay equal so the stable-key
 * overlay finishes morphing exactly when the per-metric lines reappear.
 */
const LINE_ANIMATION_DURATION = 500;

/**
 * Props for the {@link ChartTooltipContent} component.
 *
 * @remarks
 * Recharts re-mounts/updates the tooltip content with `active`/`payload` props
 * controlled by hover state.
 */
interface ChartTooltipContentProps {
	/** Whether the tooltip is currently active (hovered). */
	active?: boolean;
	/** List of all metrics being displayed in the chart. */
	activeMetrics: string[];
	/** Recharts data payload for the active point. */
	payload?: ReadonlyArray<{ payload?: ChartDataPoint }>;
	/** The currently selected metric ID, or null for the overall view. */
	selectedMetric: null | string;
}

/**
 * Custom tooltip content for the performance chart.
 *
 * @remarks
 * Renders metric details (p50, p75, p90) when a specific metric is selected,
 * or an overall score summary when viewing the aggregate trend.
 *
 * @param props - Component properties.
 *
 * @returns {JSX.Element | null} The rendered tooltip or null if inactive.
 *
 * @see {@link ./PerformanceChart.test.tsx Unit Tests}
 */
const ChartTooltipContent = memo<ChartTooltipContentProps>(function ChartTooltipContent({
	active,
	activeMetrics,
	payload,
	selectedMetric,
}) {
	if (!active || !payload || !payload.length) return null;

	const item = payload[0].payload;
	if (!item) return null;

	if (selectedMetric) {
		const format = (v: number) => formatMetricValue(selectedMetric, v);
		const p50 = item[`${selectedMetric}_p50`] as number | undefined;
		const p75 = item[`${selectedMetric}_p75_sma`] as number | undefined;
		const p90 = item[`${selectedMetric}_p90`] as number | undefined;
		const threshold = METRIC_THRESHOLDS[selectedMetric] || 10000;

		return (
			<Flex direction="column" gap="1" style={CHART_TOOLTIP_STYLE}>
				<Text color="gray" mb="1" size="1">
					{item.displayDate} {item.hour}
					{item.originalVersion || item.appVersion
						? ` (${item.originalVersion || item.appVersion})`
						: ""}
				</Text>
				{p90 !== undefined && (
					<Flex gap="4" justify="between">
						<Text color="gray">p90</Text>
						<Text style={{ color: getStatusColor(selectedMetric, p90) }} weight="bold">
							{p90 > threshold ? `>${format(threshold)}` : format(p90)}
						</Text>
					</Flex>
				)}
				{p75 !== undefined && (
					<Flex gap="4" justify="between">
						<Text color="gray">p75</Text>
						<Text style={{ color: getStatusColor(selectedMetric, p75) }} weight="bold">
							{p75 > threshold ? `>${format(threshold)}` : format(p75)}
						</Text>
					</Flex>
				)}
				{p50 !== undefined && (
					<Flex gap="4" justify="between">
						<Text color="gray">p50</Text>
						<Text style={{ color: getStatusColor(selectedMetric, p50) }} weight="bold">
							{format(p50)}
						</Text>
					</Flex>
				)}
			</Flex>
		);
	}

	const score = item.overall_score_p75_sma as number | undefined;

	return (
		<Flex direction="column" gap="2" style={CHART_TOOLTIP_STYLE}>
			<Flex direction="column" gap="0">
				<Text color="gray" size="1">
					{item.displayDate} {item.hour}
					{item.originalVersion || item.appVersion
						? ` (${item.originalVersion || item.appVersion})`
						: ""}
				</Text>
				<Flex align="center" gap="2">
					<Text size="3" style={{ color: SCORE_BAND_COLOR(score) }} weight="bold">
						{score !== undefined ? Math.round(score) : "—"}
					</Text>
					<Text color="gray" size="1">
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
					const val = item[`${m}_p75_sma`] as number | undefined;
					const mDeficit = item[`${m}_deficit_sma`] as number | undefined;
					const mScore = mDeficit !== undefined ? 100 - mDeficit : undefined;

					return (
						<Flex align="center" gap="4" justify="between" key={m}>
							<Flex align="center" gap="2">
								<div
									style={{
										backgroundColor: getMetricColor(m, 11),
										borderRadius: 2,
										height: 8,
										width: 8,
									}}
								/>
								<Text size="1" style={{ color: getMetricColor(m, 11) }}>
									{m}
								</Text>
							</Flex>
							<Flex align="center" gap="2">
								<Text
									size="1"
									style={{ color: getStatusColor(m, val) }}
									weight="bold"
								>
									{val !== undefined ? formatMetricValue(m, val) : "—"}
								</Text>
								<Text color="gray" size="1">
									({mScore !== undefined ? Math.round(mScore) : "—"})
								</Text>
							</Flex>
						</Flex>
					);
				})}
			</Flex>
		</Flex>
	);
});

/**
 * Properties for the {@link PerformanceChart} component.
 */
interface PerformanceChartProps {
	/** Raw performance metric records fetched from the API. */
	data: PerformanceMetric[];
	/** Whether a data transition is currently in flight. */
	isPending?: boolean;
	/** Callback triggered when the date range selection changes. */
	onRangeChange?: (range: number) => void;
	/** Currently selected date range in days. */
	range?: number;
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
export const PerformanceChart: FC<PerformanceChartProps> = ({
	data,
	isPending,
	onRangeChange,
	range = 3,
}) => {
	const { metric } = useParams<{ metric?: string }>();
	const navigate = useNavigate();
	const { search } = useLocation();
	const { i18n } = useTranslation();

	const selectedMetric = useMemo(() => (metric ? metric.toUpperCase() : null), [metric]);

	// True for the ~500ms window during which a detail↔detail morph is in flight.
	// While true, per-metric lines hide and a stable-key overlay handles the morph.
	const [isMorphing, setIsMorphing] = useState(false);
	const morphTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);
	const lastMetricRef = useRef<null | string>(selectedMetric);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (morphTimeoutRef.current) clearTimeout(morphTimeoutRef.current);
		};
	}, []);

	// Synchronize morphing state with metric changes (including back/forward navigation)
	useEffect(() => {
		if (
			lastMetricRef.current !== null &&
			selectedMetric !== null &&
			lastMetricRef.current !== selectedMetric
		) {
			// Trigger morphing for detail-to-detail transitions
			setIsMorphing(true);
			if (morphTimeoutRef.current) clearTimeout(morphTimeoutRef.current);
			morphTimeoutRef.current = setTimeout(
				() => setIsMorphing(false),
				LINE_ANIMATION_DURATION
			);
		}

		lastMetricRef.current = selectedMetric;
	}, [selectedMetric]);

	const updateSelectedMetric = useCallback(
		(next: null | string) => {
			// updateSelectedMetric now strictly handles the navigation intent.
			// The morphing state is handled by the useEffect above to cover all
			// navigation types (clicks, back/forward buttons, deep links).
			const lang = (i18n.language || "en").split("-")[0];
			const isDefaultLang = lang === "en";
			const basePath = isDefaultLang ? "/performance" : `/${lang}/performance`;

			if (next) {
				navigate(`${basePath}/${next.toLowerCase()}/${search}`);
			} else {
				navigate(`${basePath}/${search}`);
			}
		},
		[navigate, i18n.language, search]
	);
	const locale = i18n.language;
	const { chartData, summary, uniqueMetrics } = useMemo(
		() => transformPerformanceData(data, locale, PERFORMANCE_LAYOUT.MAX_CHART_POINTS, 3, range),
		[data, locale, range]
	);

	const versionChanges = useMemo(() => getVersionChanges(chartData), [chartData]);

	const activeMetrics = useMemo(
		() => METRIC_DISPLAY_ORDER.filter((m) => uniqueMetrics.includes(m)),
		[uniqueMetrics]
	);

	const overallScore = summary?.metrics.OVERALL?.score;
	const overallTrend = summary?.trends.OVERALL ?? "neutral";

	const yDomain = useMemo<[number, number]>(
		() => (selectedMetric ? [0, METRIC_THRESHOLDS[selectedMetric] || 10000] : OVERALL_Y_DOMAIN),
		[selectedMetric]
	);
	const selectedMetricConfig = selectedMetric ? LIGHTHOUSE_CONFIG[selectedMetric] : null;

	const xTickFormatter = useCallback(
		(val: number) => {
			const date = new Date(val);
			const formatOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "numeric" };

			return getFormatter(locale, formatOptions).format(date);
		},
		[locale]
	);

	const renderTooltip = useCallback(
		(props: { active?: boolean; payload?: ReadonlyArray<{ payload?: ChartDataPoint }> }) => (
			<ChartTooltipContent
				active={props.active}
				activeMetrics={activeMetrics}
				payload={props.payload}
				selectedMetric={selectedMetric}
			/>
		),
		[selectedMetric, activeMetrics]
	);

	return (
		<PerformanceDashboardLayout
			cards={
				<Flex gap="3" justify="between" wrap="wrap">
					{/* Overall Summary Toggle Card */}
					<MetricSummaryCard
						ariaLabel="View overall performance summary"
						borderColor="var(--accent-11)"
						isSelected={selectedMetric === null}
						onActivate={() => updateSelectedMetric(null)}
					>
						<Text size="1" weight="bold">
							OVERALL
						</Text>
						<Flex align="center" gap="1">
							<Text
								size="5"
								style={{ color: SCORE_BAND_COLOR(overallScore) }}
								weight="medium"
							>
								{overallScore !== undefined ? Math.round(overallScore) : "—"}
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
					</MetricSummaryCard>

					{activeMetrics.map((metric) => {
						const metricData = summary?.metrics[metric];
						const val = metricData?.value ?? null;
						const isSelected = selectedMetric === metric;
						const trend = summary?.trends[metric] ?? "neutral";

						return (
							<MetricSummaryCard
								ariaLabel={`View detailed ${metric} chart`}
								borderColor={getMetricColor(metric, 11)}
								isSelected={isSelected}
								key={`stat-${metric}`}
								onActivate={() => updateSelectedMetric(isSelected ? null : metric)}
							>
								<Text
									size="1"
									style={{ color: getMetricColor(metric, 11) }}
									weight="bold"
								>
									{metric}
								</Text>
								<Flex align="center" gap="1">
									<Text
										size="5"
										style={{ color: getStatusColor(metric, val) }}
										weight="medium"
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
							</MetricSummaryCard>
						);
					})}
				</Flex>
			}
			chart={
				<div
					style={{
						height: PERFORMANCE_LAYOUT.CHART_HEIGHT,
						minWidth: 0,
						opacity: isPending ? 0.365 : 1,
						position: "relative",
						transition: "opacity 0.2s",
						width: "100%",
					}}
				>
					<ResponsiveContainer
						debounce={RESPONSIVE_CONTAINER_DEBOUNCE}
						height={PERFORMANCE_LAYOUT.CHART_HEIGHT}
						width="100%"
					>
						<ComposedChart
							accessibilityLayer
							aria-label="Performance metrics timeseries chart"
							data={chartData}
							margin={CHART_MARGIN}
							role="img"
						>
							<CartesianGrid
								stroke="var(--gray-4)"
								strokeDasharray="3 3"
								vertical={false}
							/>

							{/* Dynamic Background Threshold Bands */}
							{selectedMetric ? (
								<>
									{/* Detail View: Highlight the 'Good' zone */}
									<ReferenceArea
										fill={getMetricColor(selectedMetric, "a4")}
										stroke="none"
										y1={0}
										y2={selectedMetricConfig?.p90 || 1000}
									/>
									<ReferenceLine
										stroke={getMetricColor(selectedMetric, "a7")}
										strokeDasharray="0"
										strokeWidth={1.5}
										y={selectedMetricConfig?.p90 || 1000}
									/>
								</>
							) : (
								<>
									{/* Overall Ceiling: Success (90-100 score) and Needs Improvement (50-90 score) */}
									<ReferenceArea
										fill="var(--green-a4)"
										stroke="none"
										y1={90}
										y2={100}
									/>
									<ReferenceArea
										fill="var(--yellow-a4)"
										stroke="none"
										y1={50}
										y2={90}
									/>

									{/* Metric Floor: Success (0-10 deficit) */}
									<ReferenceArea
										fill="var(--green-a4)"
										stroke="none"
										y1={0}
										y2={20}
									/>

									<ReferenceLine
										stroke="var(--green-a7)"
										strokeDasharray="0"
										strokeWidth={1.5}
										y={90}
									/>
									<ReferenceLine
										stroke="var(--yellow-a7)"
										strokeDasharray="0"
										strokeWidth={1.5}
										y={50}
									/>
									<ReferenceLine
										stroke="var(--green-a7)"
										strokeDasharray="0"
										strokeWidth={1.5}
										y={20}
									/>
								</>
							)}

							{versionChanges.map((change) => (
								<ReferenceLine
									key={change.timestamp}
									stroke="var(--gray-9)"
									strokeDasharray="2 4"
									strokeWidth={1}
									x={change.timestamp}
								>
									<Label
										fill="var(--gray-11)"
										fontSize={10}
										fontWeight={600}
										offset={4}
										position="insideTopLeft"
										value={
											change.version.startsWith("v")
												? change.version
												: `v${change.version}`
										}
									/>
								</ReferenceLine>
							))}

							<XAxis
								axisLine={false}
								dataKey="timestamp"
								minTickGap={30}
								tick={CHART_TICK_STYLE}
								tickFormatter={xTickFormatter}
								tickLine={true}
							/>

							<YAxis
								allowDataOverflow
								axisLine={false}
								domain={yDomain}
								tick={CHART_TICK_STYLE}
								tickLine={false}
								width={40}
							/>

							{/* Hidden secondary axis so the overall (0-100) score can stay
							 * visible in detail views without being squished against the
							 * metric's threshold domain. */}
							<YAxis
								allowDataOverflow
								domain={OVERALL_Y_DOMAIN}
								hide
								yAxisId="overall"
							/>

							<Tooltip
								allowEscapeViewBox={TOOLTIP_ALLOW_ESCAPE}
								content={renderTooltip}
								isAnimationActive={false}
								offset={10}
								wrapperStyle={TOOLTIP_WRAPPER_STYLE}
							/>

							{/* Unified Dynamic Range Bar (Stable Identity) */}
							<Bar
								dataKey={
									selectedMetric
										? `${selectedMetric}_range`
										: "overall_score_range"
								}
								fill={getMetricColor(selectedMetric ?? "OVERALL", 11)}
								fillOpacity={0.2}
								key="unified-range-bar"
								radius={[2, 2, 2, 2]}
							/>

							{/* Individual Metric Lines (Morphed) — original null↔detail behavior.
							 * Hidden during a detail↔detail morph; the overlay below handles that. */}
							{activeMetrics.map((m) => {
								const isSelected = selectedMetric === m;
								const visible =
									!isMorphing && (selectedMetric === null || isSelected);

								return (
									<Line
										activeDot={
											isSelected && !isMorphing ? ACTIVE_DOT_STYLE : false
										}
										animationDuration={LINE_ANIMATION_DURATION}
										connectNulls
										dataKey={isSelected ? `${m}_p75_sma` : `${m}_deficit_sma`}
										dot={false}
										isAnimationActive={true}
										key={`metric-line-${m}`}
										stroke={getMetricColor(m, 11)}
										strokeOpacity={visible ? 1 : 0}
										strokeWidth={isSelected ? 3 : 1.75}
										type="monotone"
									/>
								);
							})}

							{/* Overall Trend Line — primary in overall view; in detail views,
							 * rendered as a secondary reference using the same 1.75px solid
							 * style as the per-metric deficit lines, plotted against the
							 * hidden 0-10 axis. */}
							<Line
								activeDot={selectedMetric === null ? OVERALL_DOT_STYLE : false}
								animationDuration={LINE_ANIMATION_DURATION}
								connectNulls
								dataKey="overall_score_p75_sma"
								dot={false}
								isAnimationActive={true}
								key="overall-trend-line"
								stroke={getMetricColor(
									"OVERALL",
									selectedMetric === null ? 11 : "a7"
								)}
								strokeOpacity={selectedMetric === null ? 1 : 0.8}
								strokeWidth={selectedMetric === null ? 3 : 1.75}
								type="monotone"
								yAxisId="overall"
							/>

							{/* Detail↔detail morph overlay — stable key, only visible while morphing */}
							{selectedMetric && (
								<Line
									activeDot={isMorphing ? ACTIVE_DOT_STYLE : false}
									animationDuration={LINE_ANIMATION_DURATION}
									connectNulls
									dataKey={`${selectedMetric}_p75_sma`}
									dot={false}
									isAnimationActive={true}
									key="selected-detail-line"
									stroke={getMetricColor(selectedMetric, 11)}
									strokeOpacity={isMorphing ? 1 : 0}
									strokeWidth={3}
									type="monotone"
								/>
							)}

							{/* Version-average trend line — stepped line showing the mean
							 * value per app version for quick release-to-release comparison */}
							{selectedMetric && (
								<Line
									activeDot={false}
									animationDuration={LINE_ANIMATION_DURATION}
									connectNulls
									dataKey={`${selectedMetric}_version_avg`}
									dot={{
										fill: getMetricColor(selectedMetric, 9),
										r: 4,
										stroke: "var(--color-background)",
										strokeWidth: 2,
									}}
									isAnimationActive={true}
									key="version-avg-line"
									stroke={getMetricColor(selectedMetric, 9)}
									strokeWidth={2}
									type="linear"
								/>
							)}
						</ComposedChart>
					</ResponsiveContainer>
				</div>
			}
			range={
				<SegmentedControl.Root
					onValueChange={(v) => onRangeChange?.(Number(v))}
					size="1"
					value={String(range || 3)}
				>
					<SegmentedControl.Item value="3">3d</SegmentedControl.Item>
					<SegmentedControl.Item value="7">7d</SegmentedControl.Item>
					<SegmentedControl.Item value="14">14d</SegmentedControl.Item>
				</SegmentedControl.Root>
			}
		/>
	);
};
