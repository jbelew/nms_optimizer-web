// src/components/AppDialog/UserStatsDialog.tsx
import type { UserStat } from "../../hooks/useUserStats/useUserStats";
import type { FC } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { useTechTreeColors } from "../../hooks/useTechTreeColors/useTechTreeColors";
import { useUserStats } from "../../hooks/useUserStats/useUserStats";
import AppDialog from "./AppDialog";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6F61"];

/**
 * Props for the UserStatsDialog component.
 */
interface UserStatsDialogProps {
	/**
	 *  Indicates whether the dialog is open or closed.
	 */
	isOpen: boolean;
	/**
	 * Callback function to be called when the dialog is closed.
	 */
	onClose: () => void;
}

/**
 * UserStatsDialog component displays user statistics in a dialog.
 * It aggregates and visualizes data related to starship and multitool usage.
 *
 * @param {UserStatsDialogProps} props - The props for the component.
 * @param {boolean} props.isOpen - Indicates whether the dialog is open or closed.
 * @param {() => void} props.onClose - Callback function to be called when the dialog is closed.
 * @returns {FC<UserStatsDialogProps>} The UserStatsDialog component.
 */
const UserStatsDialog: FC<UserStatsDialogProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();
	const { data, loading, error } = useUserStats();
	const { techColors, loading: colorsLoading, error: colorsError } = useTechTreeColors();

	const STARSHIP_TYPES = ["standard", "sentinel", "solar"];
	const MULTITOOL_TYPES = ["standard-mt", "sentinel-mt", "atlantid", "staves"];

	/**
	 * Aggregates user statistics data based on supercharged status and ship types.
	 *
	 * @param {UserStat[] | null} rawData - The raw user statistics data.
	 * @param {string[]} shipTypes - An array of ship types to filter by.
	 * @returns {{ name: string; value: number }[]} Aggregated data for charting.
	 */
	const aggregateData = (rawData: UserStat[] | null, shipTypes: string[]) => {
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
	 * Renders a PieChart component with the given data and title.
	 *
	 * @param {{ name: string; value: number }[]} chartData - The data to be displayed in the chart.
	 * @param {string} titleKey - The translation key for the chart title.
	 * @returns {JSX.Element} The rendered PieChart component.
	 */
	const renderChart = (chartData: { name: string; value: number }[], titleKey: string) => {
		if (chartData.length === 0) {
			return <Text>{t("dialogs.userStats.noDataForChart")}</Text>;
		}
		return (
			<>
				<Heading
					trim="end"
					as="h2"
					mb="3"
					className="!text-base sm:!text-lg"
					style={{ color: "var(--accent-a11)" }}
				>
					{t(titleKey)}
				</Heading>
				<ResponsiveContainer width="100%" height={240}>
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							innerRadius="50%"
							outerRadius="100%"
							paddingAngle={0}
							dataKey="value"
							label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
								const RADIAN = Math.PI / 180;
								const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
								const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
								const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

								return (
									<text
										x={x}
										y={y}
										fill="white"
										textAnchor="middle"
										dominantBaseline="central"
										fontSize={14}
									>
										<tspan x={x} dy="-0.4em">
											{name}
										</tspan>
										<tspan x={x} dy="1.2em">
											{percent ? `${(percent * 100).toFixed(0)}%` : ""}
										</tspan>
									</text>
								);
							}}
							labelLine={false}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={
										techColors[entry.name]
											? `var(--${techColors[entry.name]}-track)`
											: COLORS[index % COLORS.length]
									}
									stroke="black"
									strokeWidth={1}
								/>
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
			</>
		);
	};

	const starshipData = aggregateData(data, STARSHIP_TYPES);
	const multitoolData = aggregateData(data, MULTITOOL_TYPES);

	return (
		<AppDialog
			isOpen={isOpen}
			onClose={onClose}
			titleKey="dialogs.titles.userStats"
			content={
				<>
					<Text size={{ initial: "2", sm: "3" }} as="p" mb="4">
						{t("dialogs.userStats.description")}
					</Text>
					<Flex direction="column" gap="4">
						{(loading || colorsLoading) && (
							<Text align="center" style={{ color: "var(--accent-track)" }}>
								{t("dialogs.userStats.loading")}
							</Text>
						)}
						{(error || colorsError) && <Text color="red">{t("dialogs.userStats.error")}</Text>}
						{!(loading || colorsLoading || error || colorsError) && (
							<>
								{renderChart(starshipData, "dialogs.userStats.starshipChartTitle")}
								{renderChart(multitoolData, "dialogs.userStats.multitoolChartTitle")}
							</>
						)}
					</Flex>
					<Flex gap="2" mt="4" justify="end">
						<Dialog.Close asChild>
							<Button variant="soft" onClick={onClose}>
								{t("dialogs.userStats.closeButton")}
							</Button>
						</Dialog.Close>
					</Flex>
				</>
			}
		/>
	);
};

export default UserStatsDialog;
