import { FC, Suspense } from "react";
import { Flex, Heading, Skeleton, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

import { UserStatsData } from "./UserStatsData";

/**
 * Props for the `UserStatsContent` component.
 */
interface UserStatsContentProps {
	/** Whether the dialog is currently open. Used to trigger lazy data fetching. */
	isOpen: boolean;
}

/**
 * A component that renders the detailed user statistics content.
 *
 * @remarks
 * It provides a summary of global community optimization trends, visualized
 * through pie charts for different equipment categories. Data is fetched from
 * the analytics backend. This component is typically rendered within a dialog.
 *
 * @param {UserStatsContentProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered statistics content UI.
 *
 * @see {@link ./UserStatsContent.test.tsx Unit Tests}
 * @see {@link import('../../../hooks/useUserStats/useUserStats').useUserStats}
 * @see {@link UserStatsData}
 * @see {@link ErrorBoundary}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UserStatsContent isOpen={true} />
 * ```
 */
export const UserStatsContent: FC<UserStatsContentProps> = ({ isOpen }) => {
	const { t } = useTranslation();

	return (
		<>
			<Text as="p" mb="4" size={{ initial: "2", sm: "3" }}>
				{t("dialogs.userStats.description")}
			</Text>

			<ErrorBoundary fallback={<Text color="red">{t("dialogs.userStats.error")}</Text>}>
				<Suspense
					fallback={
						<Flex direction="column" gap="4">
							<Heading
								as="h2"
								className="text-base! sm:text-lg!"
								mb="3"
								style={{ color: "var(--accent-a11)" }}
								trim="end"
							>
								<Skeleton>{t("dialogs.userStats.starshipChartTitle")}</Skeleton>
							</Heading>
							<Skeleton height="248px" width="100%" />
							<Heading
								as="h2"
								className="text-base! sm:text-lg!"
								mb="3"
								style={{ color: "var(--accent-a11)" }}
								trim="end"
							>
								<Skeleton>{t("dialogs.userStats.multitoolChartTitle")}</Skeleton>
							</Heading>
							<Skeleton height="248px" width="100%" />
						</Flex>
					}
				>
					<UserStatsData isOpen={isOpen} />
				</Suspense>
			</ErrorBoundary>
		</>
	);
};

export default UserStatsContent;
