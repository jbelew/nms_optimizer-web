import type { FC } from "react";
import React, { useEffect } from "react";
import { Button, Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import { ErrorDisplay } from "@/components/ErrorBoundary/ErrorBoundary";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useOptimizeStore } from "@/store/ui/uiStore";
import { buildExceptionEvent } from "@/utils/analytics/tracking";

/**
 * Props for the {@link ErrorDialog} component.
 *
 * @category Components
 */
interface ErrorDialogProps {
	/**
	 * Optional override for the dialog's open state.
	 * If not provided, it will be derived from the global optimize store.
	 */
	isOpen?: boolean;
	/**
	 * Optional override for the close handler.
	 * If not provided, it will use the default `setShowError(false)` action.
	 */
	onClose?: () => void;
}

/**
 * A dialog component that manages the display of optimization and server error dialogs.
 *
 * @remarks
 * This component is designed to be rendered at the root level of the application.
 * It listens to the global error state from `useOptimizeStore`, renders a user-friendly
 * disruption message with GitHub issue reporting links, displays stack details via
 * {@link ErrorDisplay}, and triggers automated error analytics. It also accepts props
 * for controlled use in testing and Storybook.
 *
 * @returns The rendered error dialog, or `null` if no error is active.
 *
 * @see {@link ErrorDialogProps}
 * @see {@link useAnalytics}
 * @see {@link useOptimizeStore}
 * @see {@link AppDialog}
 * @see {@link ErrorDisplay}
 * @see {@link ./ErrorDialog.test.tsx Unit Tests}
 * @see {@link ./ErrorDialog.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ErrorDialog />
 * // mounts ErrorDialog
 * ```
 */
export const ErrorDialog: FC<ErrorDialogProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const status = useOptimizeStore((s) => s.status);
	const setShowError = useOptimizeStore((s) => s.setShowError);

	const isError = propIsOpen ?? status.type === "error";
	const error = status.type === "error" ? status.details : null;
	const handleClose = propOnClose ?? (() => setShowError(false));

	useEffect(() => {
		if (!isError) {
			return;
		}

		document.body.classList.add("error-boundary-visible");

		if (error) {
			sendEvent(buildExceptionEvent(error, false, "HandledError"));
		}

		return () => {
			document.body.classList.remove("error-boundary-visible");
		};
	}, [error, isError, sendEvent]);

	if (!isError && propIsOpen === undefined) {
		return null;
	}

	const content = (
		<>
			<span className="errorContent__title block text-center text-xl font-semibold tracking-widest">
				{t("errorContent.signalDisruption")}
			</span>
			<Text as="p">
				<Trans
					components={{
						1: (
							<Link
								href="https://github.com/jbelew/nms_optimizer-web/issues"
								rel="noopener noreferrer"
								target="_blank"
								underline="always"
								weight="medium"
							/>
						),
					}}
					i18nKey="errorContent.serverErrorDetails"
				/>
			</Text>

			{error && <ErrorDisplay error={error} />}
		</>
	);

	const footer = (
		<Button
			onClick={handleClose}
			variant="soft"
		>
			{t("common.closeDialog")}
		</Button>
	);

	return (
		<AppDialog
			content={content}
			footer={footer}
			isOpen={isError}
			onClose={handleClose}
			title={t("dialogs.titles.serverError")}
			titleKey="dialogs.titles.serverError"
		/>
	);
};
