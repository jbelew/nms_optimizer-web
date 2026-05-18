import React from "react";

import GridShake from "@/components/GridShake/GridShake";

/**
 * Root component for the GridTable, providing the shake effect and layout container.
 */
export const GridTableRoot: React.FC<{
	children: React.ReactNode;
	duration?: number;
}> = ({ children, duration = 500 }) => {
	return <GridShake duration={duration}>{children}</GridShake>;
};
