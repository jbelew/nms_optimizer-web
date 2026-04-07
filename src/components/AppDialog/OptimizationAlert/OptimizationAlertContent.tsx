import type { FC } from "react";
import { Close as DialogClose } from "@radix-ui/react-dialog";
import { Button, Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

/**
 * Properties for the `OptimizationAlertContent` component.
 *
 * @category Components
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
 * Renders the alert message when pattern matching fails to find an optimal fit.
 *
 * @remarks
 * This component handles the internal state of the optimization failure alert.
 * It provides the user with an explanation of why the layout failed and
 * offers a "Force Optimize" option as a more computationally intensive
 * alternative.
 *
 * @param {OptimizationAlertContentProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered alert content.
 *
 * @see {@link ./OptimizationAlertContent.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <OptimizationAlertContent
 *   technologyName="Pulse Engine"
 *   onClose={handleClose}
 *   onForceOptimize={handleForce}
 * />
 * ```
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
	 *
	 * @example Interaction handler
	 * ```typescript
	 * handleForceOptimizeClick();
	 * ```
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
