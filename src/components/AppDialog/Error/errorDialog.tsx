import type { FC } from "react";
import { lazy, Suspense } from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useOptimizeStore } from "../../../store/app/optimizeStore";

const AppDialog = lazy(() => import("../Base/AppDialog"));
const ErrorContent = lazy(() => import("./ErrorContent"));

/**
 * A wrapper component that manages the display of error dialogs.
 *
 * @remarks
 * This component is designed to be rendered at the root level of the application.
 * It listens to the global error state from `useOptimizeStore` and conditionally
 * renders a lazy-loaded error dialog. This approach keeps the error-related
 * UI and styles out of the critical path.
 *
 * @returns {JSX.Element | null} The rendered error dialog, or `null` if no error is active.
 *
 * @see {@link useOptimizeStore}
 * @see {@link AppDialog}
 * @see {@link ErrorContent}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ErrorDialog />
 * ```
 */
export const ErrorDialog: FC = () => {
	const { t } = useTranslation();
	const { setShowError, showError } = useOptimizeStore();

	if (!showError) {
		return null;
	}

	const footer = (
		<div className="flex justify-end gap-2">
			<Button onClick={() => setShowError(false)} variant="soft">
				{t("common.closeDialog")}
			</Button>
		</div>
	);

	return (
		<Suspense fallback={null}>
			<AppDialog
				content={<ErrorContent />}
				footer={footer}
				isOpen={showError}
				onClose={() => setShowError(false)}
				title={t("dialogs.titles.serverError")}
				titleKey="dialogs.titles.serverError"
			/>
		</Suspense>
	);
};
