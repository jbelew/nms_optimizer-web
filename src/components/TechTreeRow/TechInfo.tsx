import React from "react";
import { Text } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";

interface TechInfoProps {
	tech: string;
	translatedTechName: string;
}

/**
 * Renders the information for a tech tree row, including the name.
 *
 * @param {TechInfoProps} props - The props for the component.
 * @returns {JSX.Element} The rendered tech info.
 */
export const TechInfo: React.FC<TechInfoProps> = ({ translatedTechName }) => {
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
