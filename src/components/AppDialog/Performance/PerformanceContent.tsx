import { FC, Suspense } from "react";
import { Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import MessageSpinner from "@/components/MessageSpinner/MessageSpinner";

import { PerformanceData } from "./PerformanceData";
import { FULL_DASHBOARD_HEIGHT, PERFORMANCE_LAYOUT } from "./PerformanceUtils";

/**
 * Loading skeleton that perfectly mirrors the performance dashboard layout.
 *
 * @remarks
 * Uses a single MessageSpinner centered in the dashboard area to provide
 * a clean loading experience without the overhead of maintaining individual
 * skeleton pieces.
 *
 * @component
 *
 * @example
 * <DashboardSkeleton />
 */
const DashboardSkeleton: FC = () => {
	const { t } = useTranslation();

	return (
		<div
			style={{
				height: FULL_DASHBOARD_HEIGHT,
				position: "relative",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				paddingTop: PERFORMANCE_LAYOUT.FOOTER_HEIGHT,
			}}
		>
			<MessageSpinner
				isVisible={true}
				initialMessage={t("dialogs.performance.loading", "Loading performance data...")}
			/>
		</div>
	);
};

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
		<div style={{ minHeight: FULL_DASHBOARD_HEIGHT }}>
			<ErrorBoundary
				fallback={
					<div className="p-4 text-red-500">
						{t("dialogs.performance.error", "Failed to load performance metrics.")}
					</div>
				}
			>
				<Suspense fallback={<DashboardSkeleton />}>
					<Text size={{ initial: "2", sm: "3" }} as="p" mb="3">
						{t(
							"dialogs.performance.description",
							"Aggregate Core Web Vitals and performance metrics from real user sessions (field data)."
						)}
					</Text>

					<PerformanceData isOpen={isOpen} />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
};

export default PerformanceContent;
