import React from "react";
import { Box, ScrollArea, Skeleton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { MessageSpinner } from "@/components/MessageSpinner/MessageSpinner";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

/**
 * A responsive skeleton component for the tech tree.
 *
 * @remarks
 * Renders an inlay spinner on desktop viewports (`>= 1024px`) and shimmer skeleton rows on mobile viewports.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeSkeleton height={600} />
 * // renders responsive technology tree loading placeholder
 * ```
 */
export const TechTreeSkeleton: React.FC<{ height?: null | number }> = ({ height }) => {
	const { t } = useTranslation();
	const isLarge = useBreakpoint("1024px");

	return (
		<>
			{isLarge ? (
				<ScrollArea
					className="main-app__tech-tree-sidebar shadow-sm"
					style={{
						borderRadius: "var(--radius-2)",
						flexGrow: 1,
						height: height ? `${height}px` : undefined,
						minHeight: 0,
						padding: "var(--space-5)",
					}}
				>
					<MessageSpinner
						initialMessage={t("techTree.loading")}
						isInlay={true}
						isVisible={true}
					/>
				</ScrollArea>
			) : (
				<aside className="w-full grow pt-4" style={{ minHeight: "50vh" }}>
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
