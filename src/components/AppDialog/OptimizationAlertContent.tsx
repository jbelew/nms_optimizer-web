// src/components/AppDialog/OptimizationAlertContent.tsx
import type { FC } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

interface OptimizationAlertContentProps {
	technologyName: string;
	onClose: () => void;
	onForceOptimize: () => Promise<void>;
}

/**
 * OptimizationAlertContent component displays a warning about insufficient space for optimization
 * and provides options to cancel or force optimize.
 *
 * @param {OptimizationAlertContentProps} props - The props for the OptimizationAlertContent component.
 * @returns {JSX.Element} The rendered OptimizationAlertContent component.
 */
export const OptimizationAlertContent: FC<OptimizationAlertContentProps> = ({
	technologyName,
	onClose,
	onForceOptimize,
}) => {
	const { t } = useTranslation();

	/**
	 * Handles the click event for the force optimize button.
	 * Calls the `onForceOptimize` prop.
	 */
	const handleForceOptimizeClick = async () => {
		await onForceOptimize();
	};

	return (
		<>
			<span className="errorContent__title block pb-2 text-center text-xl font-semibold tracking-widest">
				{t("dialogs.optimizationAlert.warning")}
			</span>
			<Text size={{ initial: "2", sm: "3" }} as="p" mb="2">
				<Trans
					i18nKey="dialogs.optimizationAlert.insufficientSpace"
					values={{ technologyName }}
					components={{
						1: (
							<span
								className="font-bold uppercase"
								style={{ color: "var(--accent-11)" }}
							/>
						),
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
			<Flex gap="3" mt="6" mb="2" justify="end">
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
	);
};
