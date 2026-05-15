import type { FC } from "react";
import { Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

/**
 * Properties for the `OptimizationAlertContent` component.
 *
 * @category Components
 */
interface OptimizationAlertContentProps {
	/** The display name of the technology that could not be optimized. **Must not be empty.** */
	technologyName: string;
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
 * />
 * ```
 */
export const OptimizationAlertContent: FC<OptimizationAlertContentProps> = ({ technologyName }) => {
	const { t } = useTranslation();

	return (
		<>
			<span className="errorContent__title block pb-2 text-center text-xl font-semibold tracking-widest">
				{t("dialogs.optimizationAlert.warning")}
			</span>
			<Text as="p" mb="2" size={{ initial: "2", sm: "3" }}>
				<Trans
					components={{
						1: (
							<span
								className="font-bold uppercase"
								style={{ color: "var(--accent-11)" }}
							/>
						),
					}}
					i18nKey="dialogs.optimizationAlert.insufficientSpace"
					values={{ technologyName }}
				/>
			</Text>
			<Text as="p" mb="4" size={{ initial: "2", sm: "3" }}>
				<Trans
					components={{
						1: <strong />,
					}}
					i18nKey="dialogs.optimizationAlert.forceOptimizeSuggestion"
				/>
			</Text>
		</>
	);
};
