import type { TechTree as TechTreeType } from "@/hooks/useTechTree/useTechTree";
import React from "react";

import { TechTreeContent } from "./TechTreeContent";

/**
 * Main tech tree list component.
 */
export const TechTreeList: React.FC<{ techTree: TechTreeType }> = ({ techTree }) => {
	return <TechTreeContent techTree={techTree} />;
};
