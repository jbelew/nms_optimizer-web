import React from "react";
import { Button, Dialog } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

/**
 * Props for the `DialogFooter` component.
 */
export interface DialogFooterProps {
	/** Asynchronous callback to trigger the optimization solver. **Must be provided.** */
	handleOptimizeClick: () => Promise<void>;
	/** Array of currently selected module IDs. Used to determine if the optimize button should be disabled. */
	currentCheckedModules: string[];
}

/**
 * The action bar component for the module selection dialog.
 *
 * It provides "Cancel" and "Optimize" buttons. The "Optimize" button is
 * automatically disabled if no modules are selected, as the solver requires
 * at least one module to run.
 *
 * @param {DialogFooterProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered footer area.
 *
 * @example
 * <DialogFooter handleOptimizeClick={solveFn} currentCheckedModules={['M1']} />
 */
export const DialogFooter: React.FC<DialogFooterProps> = ({
	handleOptimizeClick,
	currentCheckedModules,
}) => {
	const { t } = useTranslation();
	const isOptimizeDisabled = currentCheckedModules.length === 0;

	return (
		<div className="mt-4 mb-1 flex justify-end gap-2">
			<Dialog.Close>
				<Button variant="soft">{t("moduleSelection.cancelButton")}</Button>
			</Dialog.Close>
			<Button onClick={handleOptimizeClick} disabled={isOptimizeDisabled}>
				{t("moduleSelection.optimizeButton")}
			</Button>
		</div>
	);
};
