// src/components/AppDialog/OptimizationAlertDialog.tsx
import type { FC } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import AppDialog from "./AppDialog";

interface OptimizationAlertDialogProps {
	isOpen: boolean;
	technologyName: string | null; // The name of the technology that couldn't fit
	onClose: () => void; // Function to call when the dialog should be closed (e.g., Cancel or overlay click)
	onForceOptimize: () => Promise<void>; // Function to call when "Force Optimize" is clicked
}

const OptimizationAlertDialog: FC<OptimizationAlertDialogProps> = ({
	isOpen,
	technologyName,
	onClose,
	onForceOptimize,
}) => {
	const { t } = useTranslation();
	if (!technologyName) return null; // Don't render if there's no technology name (though isOpen should also handle this)

	const handleForceOptimizeClick = async () => {
		await onForceOptimize();
		// The dialog will close automatically if onForceOptimize sets patternNoFitTech to null,
		// which in turn sets isOpen to false.
		// If onForceOptimize doesn't guarantee closure, onClose() might be needed here too,
		// but current logic in App.tsx suggests it will.
	};

	return (
		<AppDialog
			isOpen={isOpen}
			onClose={onClose}
			titleKey="dialogs.titles.optimizationAlert"
			content={
				<>
					<span className="block pb-2 text-xl font-semibold tracking-widest text-center errorContent__title">
						{t("dialogs.optimizationAlert.warning")}
					</span>
					<Text size={{ initial: "2", sm: "3" }} as="p" mb="2">
						<Trans
							i18nKey="dialogs.optimizationAlert.insufficientSpace"
							values={{ technologyName }}
							components={{
								1: <span className="font-bold uppercase" style={{ color: "var(--accent-11)" }} />,
							}}
						/>
					</Text>
					<Text size={{ initial: "2", sm: "3" }} as="p" mb="4">
						<Trans
							i18nKey="dialogs.optimizationAlert.forceOptimizeSuggestion"
							components={{
								1: <strong />,
							}}
						/>
					</Text>
					<Flex gap="2" mt="4" justify="end">
						<Dialog.Close asChild>
							<Button
								variant="soft"
								onClick={onClose}
								aria-label={t("dialogs.optimizationAlert.cancelButton")}
							>
								{t("dialogs.optimizationAlert.cancelButton")}
							</Button>
						</Dialog.Close>
						<Dialog.Close asChild>
							<Button
								onClick={() => {
									void handleForceOptimizeClick();
								}}
								aria-label={t("dialogs.optimizationAlert.forceOptimizeButton")}
							>
								{t("dialogs.optimizationAlert.forceOptimizeButton")}
							</Button>
						</Dialog.Close>
					</Flex>
				</>
			}
		/>
	);
};

export default OptimizationAlertDialog;
