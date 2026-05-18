import React from "react";
import { Box, ScrollArea } from "@radix-ui/themes";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

/**
 * Root component for the TechTree.
 */
export const TechTreeRoot: React.FC<{
	children: React.ReactNode;
	hasRecommendedBuilds: boolean;
}> = ({ children, hasRecommendedBuilds }) => {
	const isLarge = useBreakpoint("1024px");
	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "523px";

	if (isLarge) {
		const baseHeight = parseInt(DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT, 10);
		const scrollAreaHeight = hasRecommendedBuilds
			? `${baseHeight - 47}px`
			: DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT;

		return (
			<ScrollArea
				className="main-app__tech-tree-sidebar shadow-sm"
				scrollbars="vertical"
				style={{
					borderRadius: "var(--radius-5)",
					height: scrollAreaHeight,
					padding: "var(--space-4)",
					paddingRight: "var(--space-5)",
				}}
				type="always"
			>
				{children}
			</ScrollArea>
		);
	}

	return <Box mt="4">{children}</Box>;
};
