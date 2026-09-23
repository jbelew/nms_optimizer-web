import React, { useEffect, useRef } from "react";
import { Box, ScrollArea } from "@radix-ui/themes";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { usePlatformStore } from "@/store/app/platformStore";

/**
 * Properties for the {@link TechTreeRoot} component.
 */
export interface TechTreeRootProps {
	/** Child elements rendered within the tech tree root container. */
	children: React.ReactNode;
}

/**
 * Root component for the TechTree layout container.
 *
 * @remarks
 * Renders a vertically scrollable {@link ScrollArea} on desktop viewports (`>= 1024px`),
 * and a standard {@link Box} on smaller screens. When the active ship platform changes,
 * the desktop scroll viewport automatically resets its scroll position to the top
 * so users start at the top of the newly selected platform's technology list.
 *
 * @param {TechTreeRootProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered root container.
 *
 * @see {@link usePlatformStore}
 * @see {@link useBreakpoint}
 * @see {@link ./TechTreeRoot.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeRoot>
 *   <TechTreeList techTree={techTree} />
 * </TechTreeRoot>
 * // Renders ScrollArea on desktop (>=1024px) or Box on mobile
 * ```
 */
export const TechTreeRoot: React.FC<TechTreeRootProps> = ({ children }) => {
	const isLarge = useBreakpoint("1024px");
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);
	const viewportRef = useRef<HTMLDivElement>(null);
	const prevPlatformRef = useRef(selectedPlatform);

	useEffect(() => {
		if (prevPlatformRef.current !== selectedPlatform) {
			prevPlatformRef.current = selectedPlatform;

			if (isLarge && viewportRef.current) {
				if (typeof viewportRef.current.scrollTo === "function") {
					viewportRef.current.scrollTo({ top: 0 });
				}

				viewportRef.current.scrollTop = 0;
			}
		}
	}, [isLarge, selectedPlatform]);

	if (isLarge) {
		return (
			<ScrollArea
				className="main-app__tech-tree-sidebar shadow-sm"
				ref={viewportRef}
				scrollbars="vertical"
				style={{
					borderRadius: "var(--radius-2)",
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
