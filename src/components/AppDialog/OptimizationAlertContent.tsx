// src/components/AppDialog/OptimizationAlertContent.tsx
import type { FC } from "react";
import { Close as DialogClose } from "@radix-ui/react-dialog";
import { Button, Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

/**
 * Props for the `OptimizationAlertContent` component.
 */
interface OptimizationAlertContentProps {
	/** The display name of the technology that could not be optimized. **Must not be empty.** */
	technologyName: string;
	/** Callback function triggered when the user cancels the alert. */
	onClose: () => void;
	/** Asynchronous callback to initiate a forced optimization solve. */
	onForceOptimize: () => Promise<void>;
}

/**
 * A component that renders the alert message when pattern matching fails to find a fit.
 *
 * It explains to the user that the layout is too constrained for the "Pattern" solver
 * and offers an alternative "Forced" solve using advanced search algorithms.
 *
 * @param {OptimizationAlertContentProps} props - Component properties.
 * @returns {JSX.Element} The rendered alert content.
 *
 * @example
 * <OptimizationAlertContent technologyName="Pulse Engine" onClose={closeFn} onForceOptimize={forceFn} />
 */
export const OptimizationAlertContent: FC<OptimizationAlertContentProps> = ({
	technologyName,
	onClose,
	onForceOptimize,
}) => {
	const { t } = useTranslation();

	/**
	 * Executes the forced optimization callback.
	 *
	 * @returns {Promise<void>}
	 * @example
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
				<DialogClose asChild>
					<Button
						variant="soft"
						onClick={onClose}
						aria-label={t("dialogs.optimizationAlert.cancelButton")}
					>
						{t("dialogs.optimizationAlert.cancelButton")}
					</Button>
				</DialogClose>
				<DialogClose asChild>
					<Button
						onClick={() => {
							void handleForceOptimizeClick();
						}}
						aria-label={t("dialogs.optimizationAlert.forceOptimizeButton")}
					>
						{t("dialogs.optimizationAlert.forceOptimizeButton")}
					</Button>
				</DialogClose>
			</Flex>
		</>
	);
};
