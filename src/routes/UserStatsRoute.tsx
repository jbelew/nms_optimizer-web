import type { FC } from "react";
import { lazy, Suspense } from "react";

import { useDialog } from "@/context/dialog-utils";

const UserStatsDialog = lazy(() => import("@/components/AppDialog/UserStatsDialog"));

/**
 * Route component for rendering the UserStatsDialog.
 * This is loaded lazily to prevent the charts bundle from being included in the main bundle.
 */
export const UserStatsRoute: FC = () => {
	const { closeDialog } = useDialog();

	return (
		<Suspense fallback={null}>
			<UserStatsDialog isOpen={true} onClose={closeDialog} />
		</Suspense>
	);
};
