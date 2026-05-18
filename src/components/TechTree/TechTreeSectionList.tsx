import React from "react";

import { TechTreeRow } from "@/components/TechTreeRow/TechTreeRow";
import { type TechTreeItem } from "@/hooks/useTechTree/useTechTree";

/**
 * Component that renders the list of technology items within a section.
 */
export const TechTreeSectionList: React.FC<{ technologies: TechTreeItem[] }> = ({
	technologies,
}) => {
	return (
		<>
			{technologies.map((tech: TechTreeItem) => (
				<TechTreeRow
					key={tech.key}
					tech={tech.key}
					techColor={tech.color}
					techImage={tech.image}
				/>
			))}
		</>
	);
};
