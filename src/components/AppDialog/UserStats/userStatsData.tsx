import type { UserStat } from "@/hooks/useUserStats/useUserStats";
import type { FC } from "react";
import { lazy, Suspense } from "react";
import { Flex, Heading, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useTechTreeColors } from "@/hooks/useTechTreeColors/useTechTreeColors";
import { useUserStats } from "@/hooks/useUserStats/useUserStats";
import { fetchTechTreeColors } from "@/utils/api/techTreeColorsResource";
import { fetchUserStats } from "@/utils/api/userStatsResource";

/**
 * Props passed to the Recharts label renderer for the Pie chart.
 */
interface PieLabelRenderProps {
	/** The x-coordinate of the pie chart center. */
	cx: number;
	/** The y-coordinate of the pie chart center. */
	cy: number;
	/** The inner radius of the donut ring in pixels. */
	innerRadius: number;
	/** The bisector angle of the current slice in degrees. */
	midAngle: number;
	/** The technology name displayed as the slice label. */
	name: string;
	/** The outer radius of the donut ring in pixels. */
	outerRadius: number;
	/** The fractional value (0–1) this slice represents of the whole. */
	percent: number;
}

/** Default color palette for the pie chart segments. */
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6F61"];

/**
 * Lazily loaded chart component to reduce initial bundle size.
 *
 * @remarks
 * Wraps the Recharts `PieChart` (along with `ResponsiveContainer`, `Pie`, and
 * `Cell`) behind a `React.lazy` boundary so the entire Recharts library is
 * code-split into a separate chunk and only fetched when charts are rendered.
 */
const LazyRechartsChart = lazy(async () => {
	const { Cell, Pie, PieChart, ResponsiveContainer } = await import("recharts");

	return {
		default: ({
			chartData,
			COLORS,
			techColors,
		}: {
			chartData: { name: string; value: number }[];
			COLORS: string[];
			techColors: Record<string, string>;
		}) => {
			const getCellFill = (entry: { name: string; value: number }, index: number) => {
				if (entry.name.toLowerCase() === "photonix") {
					return "#FF8042"; // orange
				}

				if (entry.name.toLowerCase() === "other") {
					return "gray";
				}

				if (techColors[entry.name]) {
					return `var(--${techColors[entry.name]}-track)`;
				}

				return COLORS[index % COLORS.length];
			};

			return (
				<ResponsiveContainer height={248} width="100%">
					<PieChart>
						<Pie
							cx="50%"
							cy="50%"
							data={chartData}
							dataKey="value"
							innerRadius="50%"
							label={(props: unknown) => {
								const {
									cx: cx_,
									cy: cy_,
									innerRadius: innerRadius_,
									midAngle,
									name,
									outerRadius: outerRadius_,
									percent,
								} = props as PieLabelRenderProps;

								const RADIAN = Math.PI / 180;
								const innerRadius = parseFloat(innerRadius_ as unknown as string);
								const outerRadius = parseFloat(outerRadius_ as unknown as string);
								const cx = parseFloat(cx_ as unknown as string);
								const cy = parseFloat(cy_ as unknown as string);

								const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
								const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
								const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

								return (
									<text
										dominantBaseline="middle"
										fill="white"
										fontSize={14}
										fontWeight="medium"
										textAnchor="middle"
										x={x}
										y={y}
									>
										<tspan dy="-0.4em" x={x}>
											{name}
										</tspan>
										<tspan className="tabular-nums" dy="1.2em" x={x}>
											{percent && percent * 100 >= 6
												? `${(percent * 100).toFixed(0)}%`
												: ""}
										</tspan>
									</text>
								);
							}}
							labelLine={false}
							outerRadius="100%"
							paddingAngle={0}
						>
							{chartData.map(
								(entry: { name: string; value: number }, index: number) => (
									<Cell
										fill={getCellFill(entry, index)}
										key={`cell-${index}`}
										stroke="black"
										strokeWidth={1}
									/>
								)
							)}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
			);
		},
	};
});

/**
 * Internal component that handles data aggregation and chart rendering.
 *
 * @remarks
 * Fetches user stats and tech tree colors in parallel and aggregates the data
 * into a format suitable for Recharts pie charts.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Whether the parent dialog is open, used to gate color fetching.
 *
 * @returns {JSX.Element} The rendered statistics data view.
 *
 * @see {@link fetchUserStats}
 * @see {@link fetchTechTreeColors}
 * @see {@link useUserStats}
 * @see {@link useTechTreeColors}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UserStatsData isOpen={true} />
 * ```
 */
export const UserStatsData: FC<{ isOpen: boolean }> = ({ isOpen }) => {
	const { t } = useTranslation();

	// Trigger parallel fetching
	fetchUserStats();
	if (isOpen) fetchTechTreeColors();

	const data = useUserStats();
	const techColors = useTechTreeColors(isOpen);

	const STARSHIP_TYPES = ["standard", "sentinel", "solar"];
	const MULTITOOL_TYPES = ["standard-mt", "sentinel-mt", "atlantid", "staves"];
	const CORVETTE_TYPES = ["corvette"];

	/**
	 * Aggregates raw analytics records into a format suitable for pie charts.
	 *
	 * @remarks
	 * Filters for supercharged modules and relevant ship types, then reduces the
	 * data to a list of `{ name: string, value: number }` pairs. It also groups small entries
	 * into an "other" category based on a 2% threshold.
	 *
	 * @param {UserStat[] | null} rawData - The list of statistics from the API.
	 * @param {string[]} shipTypes - Filter for specific ship types.
	 *
	 * @returns {Array<{ name: string, value: number }>} Aggregated and filtered chart data.
	 *
	 * @example
	 * ```typescript
	 * const starshipData = aggregateData(stats, ["standard", "sentinel", "solar"]);
	 * ```
	 */
	const aggregateData = (rawData: null | UserStat[], shipTypes: string[]) => {
		if (!rawData) return [];

		const aggregated = rawData
			.filter((item) => item.supercharged === "true" && shipTypes.includes(item.ship_type))
			.map((item) => {
				if (item.technology === "pulse-splitter") {
					return { ...item, technology: "pulse-spitter" };
				}

				return item;
			})
			.reduce(
				(acc, curr) => {
					const existing = acc.find((item) => item.name === curr.technology);

					if (existing) {
						existing.value += curr.total_events;
					} else {
						acc.push({ name: curr.technology, value: curr.total_events });
					}

					return acc;
				},
				[] as { name: string; value: number }[]
			);

		const totalValue = aggregated.reduce((sum, item) => sum + item.value, 0);
		const threshold = 0.02;

		const aboveThreshold: { name: string; value: number }[] = [];
		let otherValue = 0;

		aggregated.forEach((item) => {
			if (item.value / totalValue < threshold) {
				otherValue += item.value;
			} else {
				aboveThreshold.push(item);
			}
		});

		if (otherValue > 0) {
			aboveThreshold.push({ name: "other", value: otherValue });
		}

		return aboveThreshold;
	};

	/**
	 * Renders a labeled section containing a pie chart.
	 *
	 * @param {Array<{ name: string, value: number }>} chartData - Data to plot.
	 * @param {string} titleKey - Translation key for the section header.
	 *
	 * @returns {JSX.Element} The chart section.
	 *
	 * @example
	 * ```tsx
	 * {renderChart(starshipData, "dialogs.userStats.starshipChartTitle")}
	 * ```
	 */
	const renderChart = (chartData: { name: string; value: number }[], titleKey: string) => {
		if (chartData.length === 0) {
			return <Text>{t("dialogs.userStats.noDataForChart")}</Text>;
		}

		return (
			<>
				<Heading
					as="h2"
					className="text-base! sm:text-lg!"
					mb="3"
					style={{ color: "var(--accent-a11)" }}
					trim="end"
				>
					{t(titleKey)}
				</Heading>
				<Suspense fallback={<Skeleton height="248px" width="100%" />}>
					<LazyRechartsChart
						chartData={chartData}
						COLORS={COLORS}
						techColors={techColors}
					/>
				</Suspense>
			</>
		);
	};

	const starshipData = aggregateData(data, STARSHIP_TYPES);
	const multitoolData = aggregateData(data, MULTITOOL_TYPES);
	const corvetteData = aggregateData(data, CORVETTE_TYPES);

	return (
		<Flex direction="column" gap="4">
			{renderChart(starshipData, "dialogs.userStats.starshipChartTitle")}
			{renderChart(multitoolData, "dialogs.userStats.multitoolChartTitle")}
			{renderChart(corvetteData, "dialogs.userStats.corvetteChartTitle")}
		</Flex>
	);
};
