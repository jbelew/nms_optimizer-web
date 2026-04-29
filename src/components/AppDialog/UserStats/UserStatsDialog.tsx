import type { FC } from "react";
import { lazy, Suspense } from "react";
import { Button, Skeleton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { UserStatsContent } from "./UserStatsContent";

const AppDialog = lazy(() => import("../Base/AppDialog"));

/**
 * Props for the `UserStatsDialog` component.
 */
interface UserStatsDialogProps {
	/** Whether the statistics dialog is currently visible. */
	isOpen: boolean;
	/** Callback function to close the dialog. */
	onClose: () => void;
}

/**
 * A modal dialog that displays aggregate user optimization statistics.
 *
 * @remarks
 * This component uses React `lazy` and `Suspense` to dynamically load the heavy chart-related
 * content only when the dialog is requested, minimizing the initial bundle size.
 * It wraps the dynamic content in a standard {@link AppDialog}.
 *
 * @param {UserStatsDialogProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered statistics dialog.
 *
 * @see {@link AppDialog}
 * @see {@link import('./UserStatsContent').UserStatsContent}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <UserStatsDialog isOpen={showStats} onClose={hideFn} />
 * ```
 */
const UserStatsDialog: FC<UserStatsDialogProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();

	const footer = (
		<div className="flex justify-end gap-2">
			<Button variant="soft" onClick={onClose}>
				{t("dialogs.userStats.closeButton")}
			</Button>
		</div>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				isOpen={isOpen}
				onClose={onClose}
				titleKey="dialogs.titles.userStats"
				title={t("dialogs.titles.userStats")}
				footer={footer}
				content={
					<Suspense fallback={<Skeleton height="900px" width="100%" />}>
						<UserStatsContent isOpen={isOpen} />
					</Suspense>
				}
			/>
		</Suspense>
	);
};

export default UserStatsDialog;
