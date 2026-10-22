/**
 * User optimization statistics Routed Dialog and data resource module.
 *
 * @remarks
 * Consolidates the `/analytics/popular_data` and **Technology Category** color map
 * Suspense promise caches, data aggregation, lazy Recharts pie chart rendering,
 * and modal dialog presentation into a single deep module.
 *
 * @see {@link UserStatsDialog}
 * @see {@link ./UserStatsDialog.test.tsx Unit Tests}
 *
 * @category Components
 */

import type { FC } from "react";
import { lazy, Suspense, use } from "react";
import { Button, Flex, Heading, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import type { TechTree } from "@/hooks/useTechTree/useTechTree";
import AppDialog from "@/components/AppDialog/Base/AppDialog";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { API_URL } from "@/constants";
import { fetchTechTreeAsync } from "@/hooks/useTechTree/useTechTree";
import { apiCall } from "@/utils/api/network";

/**
 * Represents a single aggregate record of user optimization activity.
 *
 * @category Types
 */
export type UserStat = {
	/** The name of the analytics event. */
	event_name: string;
	/** The Platform Type identifier associated with the event. */
	ship_type: string;
	/** A string flag (`"true"` or `"false"`) indicating if supercharged slots were used. */
	supercharged: "false" | "true";
	/** The **Technology Category** identifier that was optimized. */
	technology: string;
	/** The total occurrences of this specific configuration. */
	total_events: number;
};

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

/**
 * Props for the {@link UserStatsContent} component.
 */
interface UserStatsContentProps {
	/** Whether the dialog is currently open. Used to gate **Technology Category** color fetching. */
	isOpen: boolean;
}

/**
 * Props for the {@link UserStatsDialog} component.
 */
interface UserStatsDialogProps {
	/** Whether the statistics dialog is currently visible. */
	isOpen: boolean;
	/** Callback function to close the dialog. */
	onClose: () => void;
}

/** Default color palette for the pie chart segments. */
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6F61"];

/** Starship Platform Type identifiers included in the starship pie chart. */
const STARSHIP_PLATFORM_TYPES = ["standard", "sentinel", "solar"];

/** Multi-Tool Platform Type identifiers included in the multi-tool pie chart. */
const MULTITOOL_PLATFORM_TYPES = ["standard-mt", "sentinel-mt", "atlantid", "staves"];

/** Corvette Platform Type identifiers included in the corvette pie chart. */
const CORVETTE_PLATFORM_TYPES = ["corvette"];

/** Session-scoped cache for popular user statistics data. */
let userStatsPromise: null | Promise<UserStat[]> = null;

/** Session-scoped cache for aggregated Technology Category colors. */
let techTreeColorsPromise: null | Promise<Record<string, string>> = null;

/**
 * Fetches popular data statistics from the analytics endpoint with session-level caching.
 *
 * @returns A promise resolving to an array of statistics objects.
 */
const fetchUserStats = (): Promise<UserStat[]> => {
	if (!userStatsPromise) {
		userStatsPromise = apiCall<UserStat[]>(
			API_URL + "analytics/popular_data?start_date=28daysAgo&end_date=today",
			{},
			10000,
		).catch((error) => {
			userStatsPromise = null;
			throw error;
		});
	}

	return userStatsPromise;
};

/**
 * Aggregates **Technology Category** colors across major Platform Types with session-level caching.
 *
 * @returns A promise resolving to a mapping of technology keys to color names.
 */
const fetchTechTreeColors = (): Promise<Record<string, string>> => {
	if (!techTreeColorsPromise) {
		techTreeColorsPromise = (async () => {
			try {
				const colors: Record<string, string> = {};

				const processTechTree = (data: TechTree) => {
					for (const category in data) {
						const categoryItems = data[category];

						if (Array.isArray(categoryItems)) {
							categoryItems.forEach((tech) => {
								if ("key" in tech && "color" in tech) {
									colors[tech.key] = tech.color;
								}
							});
						}
					}
				};

				const [starshipData, multitoolData, corvetteData] = await Promise.all([
					fetchTechTreeAsync("standard"),
					fetchTechTreeAsync("standard-mt"),
					fetchTechTreeAsync("corvette"),
				]);

				processTechTree(starshipData);
				processTechTree(multitoolData);
				processTechTree(corvetteData);

				return colors;
			} catch (error) {
				techTreeColorsPromise = null;
				throw error;
			}
		})();
	}

	return techTreeColorsPromise;
};

/**
 * Lazily loaded chart component to keep `recharts` out of the initial bundle.
 */
const LazyRechartsChart = lazy(async () => {
	const { Cell, Pie, PieChart, ResponsiveContainer } = await import("recharts");

	return {
		default: ({
			chartData,
			COLORS: palette,
			techColors,
		}: {
			chartData: { name: string; value: number }[];
			COLORS: string[];
			techColors: Record<string, string>;
		}) => {
			const getCellFill = (entry: { name: string; value: number }, index: number) => {
				if (entry.name.toLowerCase() === "photonix") {
					return "#FF8042";
				}

				if (entry.name.toLowerCase() === "other") {
					return "gray";
				}

				if (techColors[entry.name]) {
					return `var(--${techColors[entry.name]}-track)`;
				}

				return palette[index % palette.length];
			};

			return (
				<ResponsiveContainer
					height={248}
					width="100%"
				>
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
										<tspan
											dy="-0.4em"
											x={x}
										>
											{name}
										</tspan>
										<tspan
											className="tabular-nums"
											dy="1.2em"
											x={x}
										>
											{percent && percent * 100 >= 6 ?
												`${(percent * 100).toFixed(0)}%`
											:	""}
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
								),
							)}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
			);
		},
	};
});

/**
 * Aggregates raw analytics records into a format suitable for pie charts.
 *
 * @param rawData - The list of statistics from the API.
 * @param platformTypes - Filter for specific Platform Types.
 *
 * @returns Aggregated and filtered chart data with entries below 2% grouped as `"other"`.
 */
const aggregateUserStatsData = (
	rawData: null | UserStat[],
	platformTypes: string[],
): { name: string; value: number }[] => {
	if (!rawData) return [];

	const aggregated = rawData
		.filter((item) => item.supercharged === "true" && platformTypes.includes(item.ship_type))
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
			[] as { name: string; value: number }[],
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
 * Props for the {@link UserStatsData} component.
 */
interface UserStatsDataProps {
	/** Whether the dialog is currently open. Used to gate **Technology Category** color fetching. */
	isOpen: boolean;
}

/**
 * Internal Suspense reader that pre-warms both session-cached promises in parallel before calling `use()`.
 *
 * @see {@link UserStatsDataProps}
 *
 * @component
 */
const UserStatsData: FC<UserStatsDataProps> = ({ isOpen }) => {
	const { t } = useTranslation();

	const statsPromise = fetchUserStats();
	const colorsPromise = isOpen ? fetchTechTreeColors() : null;

	const data = use(statsPromise);
	const techColors = colorsPromise ? use(colorsPromise) : {};

	const renderChart = (chartData: { name: string; value: number }[], titleKey: string) => {
		if (chartData.length === 0) {
			return <Text>{t("dialogs.userStats.noDataForChart")}</Text>;
		}

		return (
			<>
				<Heading
					as="h2"
					className="heading-styled text-base! sm:text-lg!"
					mb="3"
					style={{ color: "var(--accent-a11)" }}
					trim="end"
				>
					{t(titleKey)}
				</Heading>
				<Suspense
					fallback={
						<Skeleton
							height="248px"
							width="100%"
						/>
					}
				>
					<LazyRechartsChart
						chartData={chartData}
						COLORS={COLORS}
						techColors={techColors}
					/>
				</Suspense>
			</>
		);
	};

	const starshipData = aggregateUserStatsData(data, STARSHIP_PLATFORM_TYPES);
	const multitoolData = aggregateUserStatsData(data, MULTITOOL_PLATFORM_TYPES);
	const corvetteData = aggregateUserStatsData(data, CORVETTE_PLATFORM_TYPES);

	return (
		<Flex
			direction="column"
			gap="4"
		>
			{renderChart(starshipData, "dialogs.userStats.starshipChartTitle")}
			{renderChart(multitoolData, "dialogs.userStats.multitoolChartTitle")}
			{renderChart(corvetteData, "dialogs.userStats.corvetteChartTitle")}
		</Flex>
	);
};

/**
 * Renders the user optimization statistics dashboard content inside an `ErrorBoundary` and `Suspense` boundary.
 *
 * @remarks
 * Displays global optimization trends visualized through pie charts for Starship,
 * Multi-Tool, and Corvette Platform Types.
 *
 * @param props - Component properties.
 *
 * @returns The rendered user statistics dashboard content.
 *
 * @see {@link UserStatsContentProps}
 * @see {@link UserStatsDialog}
 * @see {@link ErrorBoundary}
 * @see {@link ./UserStatsDialog.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UserStatsContent isOpen={true} />
 * // renders user statistics charts and description
 * ```
 */
export const UserStatsContent: FC<UserStatsContentProps> = ({ isOpen }) => {
	const { t } = useTranslation();

	return (
		<>
			<Text as="p">{t("dialogs.userStats.description")}</Text>

			<ErrorBoundary fallback={<Text color="red">{t("dialogs.userStats.error")}</Text>}>
				<Suspense
					fallback={
						<Flex
							direction="column"
							gap="4"
						>
							<Heading
								as="h2"
								className="text-base! sm:text-lg!"
								mb="3"
								style={{ color: "var(--accent-a11)" }}
								trim="end"
							>
								<Skeleton>{t("dialogs.userStats.starshipChartTitle")}</Skeleton>
							</Heading>
							<Skeleton
								height="248px"
								width="100%"
							/>
							<Heading
								as="h2"
								className="text-base! sm:text-lg!"
								mb="3"
								style={{ color: "var(--accent-a11)" }}
								trim="end"
							>
								<Skeleton>{t("dialogs.userStats.multitoolChartTitle")}</Skeleton>
							</Heading>
							<Skeleton
								height="248px"
								width="100%"
							/>
						</Flex>
					}
				>
					<UserStatsData isOpen={isOpen} />
				</Suspense>
			</ErrorBoundary>
		</>
	);
};

/**
 * Routed Dialog that displays aggregate user optimization statistics.
 *
 * @remarks
 * Wraps {@link UserStatsContent} in a standard {@link AppDialog} configured via
 * the Unified Page Registry (`pageId="userstats"`).
 *
 * @param props - Component properties.
 *
 * @returns The rendered user statistics dialog.
 *
 * @see {@link UserStatsDialogProps}
 * @see {@link AppDialog}
 * @see {@link UserStatsContent}
 * @see {@link ./UserStatsDialog.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UserStatsDialog isOpen={true} onClose={handleClose} />
 * // renders UserStatsDialog modal
 * ```
 */
const UserStatsDialogComponent: FC<UserStatsDialogProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();

	const footer = (
		<Button
			onClick={onClose}
			variant="soft"
		>
			{t("dialogs.userStats.closeButton")}
		</Button>
	);

	return (
		<AppDialog
			content={<UserStatsContent isOpen={isOpen} />}
			footer={footer}
			isOpen={isOpen}
			onClose={onClose}
			pageId="userstats"
		/>
	);
};

const UserStatsDialog = Object.assign(UserStatsDialogComponent, {
	/**
	 * Clears the session-scoped user statistics and technology color promise caches.
	 */
	resetCache: (): void => {
		userStatsPromise = null;
		techTreeColorsPromise = null;
	},
});

export default UserStatsDialog;
