import { FC, Suspense } from "react";
import { Flex, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

import { PerformanceData } from "./PerformanceData";

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
 * It is wrapped in an `ErrorBoundary` and `Suspense` to handle data loading
 * states gracefully.
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
					<Text color="red">
						{t("dialogs.performance.error", "Failed to load performance metrics.")}
					</Text>
				}
			>
				<Suspense
					fallback={
						<Flex direction="column" gap="4">
							<Skeleton height="446px" width="100%" />
						</Flex>
					}
				>
					<PerformanceData isOpen={isOpen} />
				</Suspense>
			</ErrorBoundary>
		</>
	);
};

export default PerformanceContent;
