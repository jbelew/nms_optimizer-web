import React from "react";
import { Box, ScrollArea, Skeleton } from "@radix-ui/themes";

import { MessageSpinner } from "@/components/MessageSpinner/MessageSpinner";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

/**
 * A responsive skeleton component for the tech tree.
 */
export const TechTreeSkeleton: React.FC = () => {
	const isLarge = useBreakpoint("1024px");
	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "523px";

	return (
		<>
			{isLarge ? (
				<ScrollArea
					className="main-app__tech-tree-sidebar shadow-sm"
					style={{
						borderRadius: "var(--radius-5)",
						height: DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT,
						padding: "var(--space-5)",
					}}
				>
					<MessageSpinner initialMessage="Loading Tech" isInlay={true} isVisible={true} />
				</ScrollArea>
			) : (
				<aside className="w-full grow pt-8" style={{ minHeight: "50vh" }}>
					<Box className="flex flex-col gap-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<React.Fragment key={i}>
								<Skeleton height="44px" mt={i === 0 ? "0" : "4"} width="100%" />
								{Array.from({ length: 3 }).map((__, j) => (
									<Skeleton height="32px" key={j} width="100%" />
								))}
							</React.Fragment>
						))}
					</Box>
				</aside>
			)}
		</>
	);
};
