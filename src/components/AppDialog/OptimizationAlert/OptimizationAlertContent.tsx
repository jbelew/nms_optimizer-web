import type { FC } from "react";
import { Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import type { WindowDimensions } from "@/types/tech";

/**
 * Properties for the `OptimizationAlertContent` component.
 *
 * @category Components
 */
interface OptimizationAlertContentProps {
	/** The display name of the technology that could not be optimized. **Must not be empty.** */
	technologyName: string;
	/** Optional `[width, height]` Solver Window dimensions required for the active Module Selection. */
	windowDimensions?: null | WindowDimensions;
}

/**
 * Renders the alert message when pattern matching fails to find an optimal fit.
 *
 * @remarks
 * This component handles the internal state of the optimization failure alert.
 * It provides the user with an explanation of why the layout failed—including
 * the required Solver Window dimensions when available—and offers a
 * "Force Optimize" option as a more computationally intensive alternative.
 *
 * @param props - Component properties.
 *
 * @returns The rendered alert content.
 *
 * @see {@link ./OptimizationAlertContent.test.tsx Unit Tests}
 * @see {@link WindowDimensions}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <OptimizationAlertContent
 *   technologyName="Pulse Engine"
 *   windowDimensions={[3, 2]}
 * />
 * ```
 */
export const OptimizationAlertContent: FC<OptimizationAlertContentProps> = ({
	technologyName,
	windowDimensions,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<span className="errorContent__title block pb-2 text-center text-xl font-semibold tracking-widest">
				{t("dialogs.optimizationAlert.warning")}
			</span>
			<Text
				as="p"
				mb="2"
				size={{ initial: "2", sm: "3" }}
			>
				<Trans
					components={{
						1: (
							<span
								className="font-bold uppercase"
								style={{ color: "var(--accent-11)" }}
							/>
						),
					}}
					i18nKey={
						windowDimensions ?
							"dialogs.optimizationAlert.insufficientSpaceWithWindow"
						:	"dialogs.optimizationAlert.insufficientSpace"
					}
					values={
						windowDimensions ?
							{
								height: windowDimensions[1],
								technologyName,
								width: windowDimensions[0],
							}
						:	{ technologyName }
					}
				/>
			</Text>
			<Text
				as="p"
				mb="4"
				size={{ initial: "2", sm: "3" }}
			>
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
