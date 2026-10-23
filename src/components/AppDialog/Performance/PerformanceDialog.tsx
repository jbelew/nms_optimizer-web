/**
 * Performance metrics Routed Dialog and data resource module.
 *
 * @remarks
 * Consolidates the `/analytics/performance_data` Suspense promise cache,
 * date range selection, loading skeleton, error boundary, and modal dialog
 * presentation into a single deep module while keeping `PerformanceChart`
 * (`recharts`) behind a `React.lazy` boundary.
 *
 * @see {@link PerformanceDialog}
 * @see {@link ./PerformanceDialog.test.tsx Unit Tests}
 *
 * @category Components
 */

import type { FC } from "react";
import { Suspense, use, useState, useTransition } from "react";
import { Button, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { MessageSpinner } from "@/components/MessageSpinner/MessageSpinner";
import { API_URL } from "@/constants";
import { apiCall } from "@/utils/api/network";
import { safeGetItem, safeSetItem } from "@/utils/browser/environment";
import { lazyNamed } from "@/utils/system/lazyNamed";

import type { PerformanceMetric, PerformanceRange } from "./PerformanceUtils";
import { FULL_DASHBOARD_HEIGHT, PERFORMANCE_LAYOUT } from "./PerformanceUtils";

/**
 * Lazily loaded chart component to keep `recharts` out of the dialog container chunk.
 */
const PerformanceChart = lazyNamed(() => import("./performanceChart"), "PerformanceChart");

/**
 * Session-scoped cache of performance metric promises keyed by date range.
 */
const performanceDataPromises = new Map<string, Promise<PerformanceMetric[]>>();

/**
 * Fetches performance data statistics from the analytics endpoint with session-level caching.
 *
 * @param startDate - The start date for the data (GA4 relative format or YYYY-MM-DD).
 * @param endDate - The end date for the data.
 *
 * @returns A promise resolving to an array of performance metrics.
 */
const fetchPerformanceData = (
	startDate = "30daysAgo",
	endDate = "today",
): Promise<PerformanceMetric[]> => {
	const rangeKey = `${startDate}-${endDate}`;

	if (!performanceDataPromises.has(rangeKey)) {
		const timestamp = new Date().getTime();
		const promise = apiCall<PerformanceMetric[]>(
			`${API_URL}analytics/performance_data?start_date=${startDate}&end_date=${endDate}&_=${timestamp}`,
			{ skipGlobalError: true },
			10000,
		).catch((error) => {
			performanceDataPromises.delete(rangeKey);
			throw error;
		});

		performanceDataPromises.set(rangeKey, promise);
	}

	return performanceDataPromises.get(rangeKey)!;
};

/**
 * Props for the {@link PerformanceDialog} component.
 */
interface PerformanceDialogProps {
	/** Whether the performance dialog is currently visible in the UI. */
	isOpen: boolean;
	/** Callback function triggered when the user requests to close the dialog. */
	onClose: () => void;
}

/**
 * Loading skeleton that mirrors the performance dashboard height.
 */
const DashboardSkeleton: FC = () => (
	<div
		style={{
			alignItems: "center",
			display: "flex",
			height: FULL_DASHBOARD_HEIGHT,
			justifyContent: "center",
			paddingTop: PERFORMANCE_LAYOUT.FOOTER_HEIGHT,
			position: "relative",
		}}
	>
		<MessageSpinner isVisible={true} />
	</div>
);

/**
 * Internal Suspense data reader and range state controller for the performance dashboard.
 */
const PerformanceData: FC = () => {
	const { t } = useTranslation();
	const [range, setRange] = useState<PerformanceRange>(() => {
		const saved = safeGetItem("nms-perf-range");

		if (saved) {
			const parsed = parseInt(saved, 10);

			if (parsed === 3 || parsed === 7 || parsed === 14) {
				return parsed;
			}
		}

		return 3;
	});
	const [isPending, startTransition] = useTransition();

	// Always fetch the maximum range (14 days) so summary cards and trends remain stable
	// across 3d, 7d, and 14d views without redundant network requests.
	const data = use(fetchPerformanceData("14daysAgo"));

	const handleRangeChange = (newRange: PerformanceRange) => {
		startTransition(() => {
			setRange(newRange);
			safeSetItem("nms-perf-range", newRange.toString());
		});
	};

	if (!data || data.length === 0) {
		return <Text>{t("dialogs.performance.noData", "No performance data available.")}</Text>;
	}

	return (
		<PerformanceChart
			data={data}
			isPending={isPending}
			onRangeChange={handleRangeChange}
			range={range}
		/>
	);
};

/**
 * Renders the performance statistics description, summary cards, and trend chart.
 *
 * @remarks
 * Wraps the data-dependent dashboard in an {@link ErrorBoundary} and `Suspense`
 * boundary with a fixed-height loading skeleton.
 *
 * @returns The rendered performance dashboard content.
 *
 * @see {@link PerformanceDialog}
 * @see {@link ./PerformanceDialog.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <PerformanceContent />
 * // renders performance dashboard content
 * ```
 */
export const PerformanceContent: FC = () => {
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
					<Text
						as="p"
						mb="3"
					>
						{t(
							"dialogs.performance.description",
							"Aggregate Core Web Vitals and performance metrics from real user sessions (field data).",
						)}
					</Text>

					<PerformanceData />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
};

/**
 * Routed Dialog that displays aggregate application performance statistics.
 *
 * @remarks
 * Wraps {@link PerformanceContent} in a standard {@link AppDialog} configured via
 * the Unified Page Registry (`pageId="performance"`).
 *
 * @param props - Component properties.
 *
 * @returns The rendered performance dialog.
 *
 * @see {@link PerformanceDialogProps}
 * @see {@link PerformanceContent}
 * @see {@link AppDialog}
 * @see {@link ./PerformanceDialog.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <PerformanceDialog isOpen={true} onClose={handleClose} />
 * // renders PerformanceDialog modal
 * ```
 */
const PerformanceDialogComponent: FC<PerformanceDialogProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();

	const footer = (
		<Button
			onClick={onClose}
			variant="soft"
		>
			{t("dialogs.performance.closeButton", "Close")}
		</Button>
	);

	return (
		<AppDialog
			content={<PerformanceContent />}
			footer={footer}
			isOpen={isOpen}
			onClose={onClose}
			pageId="performance"
		/>
	);
};

const PerformanceDialog = Object.assign(PerformanceDialogComponent, {
	/**
	 * Clears the session-scoped performance data promise cache.
	 */
	resetCache: (): void => {
		performanceDataPromises.clear();
	},
});

export default PerformanceDialog;
