import React from "react";
import { Text } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useTechTreeRow } from "./useTechTreeRow";

interface TechInfoProps {
	hookData: ReturnType<typeof useTechTreeRow>;
}

/**
 * Renders the information for a tech tree row, including the name.
 * Receives hook data from parent to avoid redundant hook calls.
 *
 * @param props - The props for the component.
 * @returns {JSX.Element} The rendered tech info.
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
