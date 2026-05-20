import type { FC } from "react";
import React from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AppDialog from "@/components/AppDialog/Base/AppDialog";
import { useOptimizeStore } from "@/store/ui/uiStore";

import ErrorContent from "./ErrorContent";

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
 * A wrapper component that manages the display of error dialogs.
 *
 * @remarks
 * This component is designed to be rendered at the root level of the application.
 * It listens to the global error state from `useOptimizeStore` and conditionally
 * renders the error dialog. It also accepts props for controlled use in
 * testing and Storybook.
 *
 * @param {ErrorDialogProps} props - Component properties.
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
export const ErrorDialog: FC<ErrorDialogProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
	const { t } = useTranslation();
	const status = useOptimizeStore((s) => s.status);
	const setShowError = useOptimizeStore((s) => s.setShowError);

	const isError = propIsOpen ?? status.type === "error";
	const handleClose = propOnClose ?? (() => setShowError(false));

	if (!isError && propIsOpen === undefined) {
		return null;
	}

	const footer = (
		<div className="flex justify-end gap-2">
			<Button onClick={handleClose} variant="soft">
				{t("common.closeDialog")}
			</Button>
		</div>
	);

	return (
		<AppDialog
			content={<ErrorContent />}
			footer={footer}
			isOpen={isError}
			onClose={handleClose}
			title={t("dialogs.titles.serverError")}
			titleKey="dialogs.titles.serverError"
		/>
	);
};
