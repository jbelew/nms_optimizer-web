import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Dialog } from "@radix-ui/themes";

/**
 * Props for the DialogFooter component.
 */
export interface DialogFooterProps {
	handleOptimizeClick: () => Promise<void>;
	handleCancelClick: () => void;
	isOptimizeDisabled: boolean;
}

/**
 * Renders the footer of the module selection dialog, containing the action buttons.
 * @param {DialogFooterProps} props - The props for the component.
 * @returns {JSX.Element} The rendered dialog footer.
 */
export const DialogFooter: React.FC<DialogFooterProps> = ({
	handleCancelClick,
	handleOptimizeClick,
	isOptimizeDisabled,
}) => {
	const { t } = useTranslation();

	return (
		<div className="mt-2 flex justify-end gap-3">
			<Dialog.Close>
				<Button variant="soft" onClick={handleCancelClick}>
					{t("moduleSelection.cancelButton")}
				</Button>
			</Dialog.Close>
			<Dialog.Close>
				<Button onClick={handleOptimizeClick} disabled={isOptimizeDisabled}>
					{t("moduleSelection.optimizeButton")}
				</Button>
			</Dialog.Close>
		</div>
	);
};