// src/components/AppDialog/OptimizationAlertDialog.tsx
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Button, Dialog, Flex } from "@radix-ui/themes";
import type { FC } from "react";
import { Trans, useTranslation } from "react-i18next";

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
		<Dialog.Root
			open={isOpen}
			onOpenChange={(openStatus) => {
				if (!openStatus) {
					onClose();
				}
			}}
		>
			<Dialog.Content maxWidth="500px">
				<Dialog.Title className="text-xl sm:text-2xl heading-styled">
					<ExclamationTriangleIcon className="inline w-6 h-6" style={{ color: "var(--amber-9)" }} />{" "}
					{t("dialogs.titles.optimizationAlert")} {/* Use existing title key */}
				</Dialog.Title>
				<Dialog.Description size="2" mb="4">
					<span className="block pb-2 text-xl font-semibold tracking-widest text-center errorContent__title">
						{t("dialogs.optimizationAlert.warning")}
					</span>
					<span className="block mb-2">
						<Trans
							i18nKey="dialogs.optimizationAlert.insufficientSpace"
							values={{ technologyName }}
							components={{
								1: <span className="font-bold uppercase" style={{ color: "var(--accent-11)" }} />,
							}}
						/>
					</span>
					<span className="block">
						<Trans
							i18nKey="dialogs.optimizationAlert.forceOptimizeSuggestion"
							components={{
								1: <strong />,
							}}
						/>
					</span>
				</Dialog.Description>
				<Flex gap="3" mt="4" justify="end">
					<Dialog.Close>
						<Button
							variant="soft"
							color="gray"
							onClick={onClose}
							aria-label={t("dialogs.optimizationAlert.cancelButton")}
						>
							{t("dialogs.optimizationAlert.cancelButton")}
						</Button>
					</Dialog.Close>
					<Dialog.Close>
						<Button
							// Wrap the async call and use 'void' to explicitly ignore the promise
							// for the onClick handler, which expects a void return.
							onClick={() => {
								void handleForceOptimizeClick();
							}}
							aria-label={t("dialogs.optimizationAlert.forceOptimizeButton")}
						>
							{t("dialogs.optimizationAlert.forceOptimizeButton")}
						</Button>
					</Dialog.Close>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default OptimizationAlertDialog;
