import React from "react";
import { Text } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Props for the {@link TechInfo} component.
 */
interface TechInfoProps {
	/** Consolidated state and handlers from the `useTechTreeRow` hook. */
	hookData: ReturnType<typeof useTechTreeRow>;
}

/**
 * Renders the localized technology name with responsive typography.
 *
 * @remarks
 * This layout component handles the display of technology names in the `TechTreeRow`.
 * It automatically adjusts font size based on the `640px` breakpoint and uses
 * `balance` text wrapping to ensure long technology names are visually pleasing.
 *
 * @param {TechInfoProps} props - Component properties.
 * @returns {JSX.Element} A themed `Text` component containing the localized name.
 *
 * @see {@link useTechTreeRow} for the data source.
 * @see {@link useBreakpoint} for responsive logic.
 *
 * @component
 * @category Components
 *
 * @example
 * ```tsx
 * // Inside a component that uses useTechTreeRow
 * const hookData = useTechTreeRow({ techId: 'HYPERDRIVE' });
 * <TechInfo hookData={hookData} />
 * ```
 */
export const TechInfo: React.FC<TechInfoProps> = ({ hookData }) => {
	const { translatedTechName } = hookData;
	const isSmallAndUp = useBreakpoint("640px");

	return (
		<Text
			as="div"
			wrap="balance"
			weight="medium"
			size={isSmallAndUp ? "3" : "2"}
			className="techRow__label block flex-1 pt-1"
		>
			{translatedTechName}
		</Text>
	);
};
