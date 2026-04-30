import { FC, Suspense } from "react";
import { Flex, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

import { PerformanceData } from "./PerformanceData";
import { CHART_HEIGHT, SUMMARY_CARDS_HEIGHT } from "./PerformanceUtils";

/**
 * A structured skeleton that mimics the layout of the dashboard data area.
 *
 * @example
 * ```tsx
 * <DashboardSkeleton />
 * ```
 */
const DashboardSkeleton: FC = () => (
	<Flex
		direction="column"
		gap="4"
		style={{
			marginTop: "4px",
			marginBottom: "4px",
			marginRight: "4px",
			marginLeft: "4px",
		}}
	>
		{/* Summary Cards Row (gap="3") */}
		<Flex gap="3" wrap="wrap" justify="between">
			{[...Array(6)].map((_, i) => (
				<Skeleton
					key={i}
					height={`${SUMMARY_CARDS_HEIGHT}px`}
					style={{ flex: "1 1 120px" }}
				/>
			))}
		</Flex>

		{/* Chart Area (gap="4" from cards row) */}
		<div style={{ marginBottom: "8px" }}>
			<Skeleton height={`${CHART_HEIGHT}px`} width="100%" />
		</div>
	</Flex>
);

/**
 * Props for the `PerformanceContent` component.
 *
 * @category Props
 */
interface PerformanceContentProps {
	/**
	 * Whether the dialog is currently open.
	 * @remarks Used to trigger lazy data fetching via the child `PerformanceData` component.
	 */
	isOpen: boolean;
}

/**
 * Detailed performance statistics content, including descriptions and chart.
 *
 * @remarks
 * Renders the high-level description, summary cards, and the main trend chart.
 * The static description is visible immediately, while the data-dependent
 * dashboard is wrapped in Suspense and an ErrorBoundary.
 *
 * @param {PerformanceContentProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered performance content UI.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <PerformanceContent isOpen={true} />
 * ```
 */
export const PerformanceContent: FC<PerformanceContentProps> = ({ isOpen }) => {
	const { t } = useTranslation();

	return (
		<>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="4">
				{t(
					"dialogs.performance.description",
					"Aggregate Core Web Vitals and performance metrics from real user sessions (field data)."
				)}
			</Text>

			<ErrorBoundary
				fallback={
					<div className="p-4 text-red-500">
						{t("dialogs.performance.error", "Failed to load performance metrics.")}
					</div>
				}
			>
				<Suspense fallback={<DashboardSkeleton />}>
					<PerformanceData isOpen={isOpen} />
				</Suspense>
			</ErrorBoundary>
		</>
	);
};

export default PerformanceContent;
