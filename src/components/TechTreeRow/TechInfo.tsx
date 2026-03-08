import React from "react";
import { Text } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Props for the `TechInfo` component.
 */
interface TechInfoProps {
	/** Consolidated state and handlers from the `useTechTreeRow` hook. */
	hookData: ReturnType<typeof useTechTreeRow>;
}

/**
 * A layout component that renders the localized name of a technology in the sidebar.
 *
 * It automatically adjusts its font size based on the viewport breakpoint and
 * uses balanced text wrapping for better readability of long technology names.
 *
 * @param {TechInfoProps} props - Component properties.
 * @returns {JSX.Element} The rendered technology name.
 *
 * @example
 * <TechInfo hookData={hookData} />
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
