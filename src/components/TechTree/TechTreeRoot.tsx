import React from "react";
import { Box, ScrollArea } from "@radix-ui/themes";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

/**
 * Root component for the TechTree.
 */
export const TechTreeRoot: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const isLarge = useBreakpoint("1024px");

	if (isLarge) {
		return (
			<ScrollArea
				className="main-app__tech-tree-sidebar shadow-sm"
				scrollbars="vertical"
				style={{
					borderRadius: "var(--radius-5)",
					flexGrow: 1,
					minHeight: 0,
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
