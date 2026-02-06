import React from "react";
import { Button, Dialog } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

/**
 * Props for the DialogFooter component.
 */
export interface DialogFooterProps {
	handleOptimizeClick: () => Promise<void>;
	currentCheckedModules: string[];
}

/**
 * Renders the footer of the module selection dialog, containing the action buttons.
 *
 * @param props - The props for the component.
 * @returns {JSX.Element} The rendered dialog footer.
 */
export const DialogFooter: React.FC<DialogFooterProps> = ({
	handleOptimizeClick,
	currentCheckedModules,
}) => {
	const { t } = useTranslation();
	const isOptimizeDisabled = currentCheckedModules.length === 0;

	return (
		<div className="mt-4 mb-2 flex justify-end gap-2">
			<Dialog.Close>
				<Button variant="soft">{t("moduleSelection.cancelButton")}</Button>
			</Dialog.Close>
			<Dialog.Close>
				<Button onClick={handleOptimizeClick} disabled={isOptimizeDisabled}>
					{t("moduleSelection.optimizeButton")}
				</Button>
			</Dialog.Close>
		</div>
	);
};
