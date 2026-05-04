import { FC, ReactNode } from "react";
import { Flex } from "@radix-ui/themes";

import { PERFORMANCE_LAYOUT } from "./PerformanceUtils";

/**
 * Shared layout component for the performance dashboard.
 *
 * @remarks
 * This component defines the structural skeleton (rows and gaps) used by both
 * the actual dashboard and the loading skeleton. By centralizing the layout
 * logic here, we ensure perfect visual consistency and avoid brittle manual
 * synchronization of heights.
 *
 * @category Layout
 *
 * @example
 * <PerformanceDashboardLayout
 *   cards={<SummaryCards />}
 *   range={<RangeSelector />}
 *   chart={<Chart />}
 * />
 */
export const PerformanceDashboardLayout: FC<{
	/** The summary cards row content. */
	cards: ReactNode;
	/** The range selector row content. */
	range: ReactNode;
	/** The main chart area content. */
	chart: ReactNode;
}> = ({ cards, range, chart }) => (
	<Flex direction="column" gap="0">
		{/* Summary Cards Row */}
		{cards}

		{/* Range Selector Row */}
		<Flex justify="end" mt={`${PERFORMANCE_LAYOUT.CARDS_TO_RANGE_GAP}px`}>
			{range}
		</Flex>

		{/* Chart Area */}
		<Flex mt={`${PERFORMANCE_LAYOUT.RANGE_TO_CHART_GAP}px`}>{chart}</Flex>
	</Flex>
);
