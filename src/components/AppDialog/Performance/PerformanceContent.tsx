import { FC, Suspense } from "react";
import { Flex, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

import { PerformanceData } from "./PerformanceData";
import { CHART_HEIGHT, FULL_DASHBOARD_HEIGHT, SUMMARY_CARDS_HEIGHT } from "./PerformanceUtils";

/**
 * A structured skeleton that mimics the layout of the dashboard data area.
 *
 * @remarks
 * This skeleton is used to prevent layout shifts while the performance data
 * and charting components are loading.
 *
 * @returns {JSX.Element} The rendered dashboard skeleton.
 *
 * @example
 * ```tsx
 * <DashboardSkeleton />
 * ```
 */
const DashboardSkeleton: FC = () => (
	<Flex direction="column" gap="4">
		{/* Summary Cards Row */}
		<Flex gap="3" wrap="wrap" justify="between">
			{[...Array(6)].map((_, i) => (
				<Skeleton
					key={i}
					height={`${SUMMARY_CARDS_HEIGHT}px`}
					style={{ flex: "1 1 120px" }}
				/>
			))}
		</Flex>

		{/* Chart Area */}
		<Skeleton height={`${CHART_HEIGHT}px`} width="100%" />
	</Flex>
);

/**
 * Props for the `PerformanceContent` component.
 *
 * @category Interfaces
 */
interface PerformanceContentProps {
	/** Whether the dialog is currently open, triggering data fetching. */
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
 * @see {@link PerformanceData}
 * @see {@link DashboardSkeleton}
 * @see {@link ./PerformanceContent.test.tsx Unit Tests}
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
		<div style={{ minHeight: FULL_DASHBOARD_HEIGHT, padding: "4px" }}>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="5" style={{ height: "40px" }}>
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
		</div>
	);
};

export default PerformanceContent;
