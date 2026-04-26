import type { FC } from "react";
import { Suspense } from "react";

import UserStatsDialog from "@/components/AppDialog/UserStats/UserStatsDialog";
import { useSeoAndTitle } from "@/hooks/useSeoAndTitle/useSeoAndTitle";
import { useDialog } from "@/utils/system/dialogUtils";

/**
 * Route component for rendering the UserStatsDialog.
 *
 * This is loaded lazily to prevent the charts bundle from being included in the main bundle.
 * It provides its own `<Suspense>` boundary to handle the chunk loading phase natively.
 *
 * @returns {JSX.Element} The suspense-wrapped dialog component.
 *
 * @see {@link UserStatsDialog}
 *
 * @example
 * <UserStatsRoute />
 * // mounts UserStatsRoute
 */
export const UserStatsRoute: FC = () => {
	const { closeDialog } = useDialog();

	useSeoAndTitle();

	return (
		<Suspense fallback={null}>
			<UserStatsDialog isOpen={true} onClose={closeDialog} />
		</Suspense>
	);
};
