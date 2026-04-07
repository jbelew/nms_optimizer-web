// src/components/MainAppContent/SharedBuildCallout.tsx
import React from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Callout } from "@radix-ui/themes";

/**
 * Props for the `SharedBuildCallout` component.
 *
 * @category Components
 */
interface SharedBuildCalloutProps {
	/**
	 * Total width of the grid table in pixels.
	 *
	 * Used to align the callout's max-width with the underlying grid to ensure
	 * a consistent visual layout across different screen sizes.
	 */
	gridTableTotalWidth: number | undefined;
}

/**
 * A notification component that appears when the user is viewing a read-only shared layout.
 *
 * @remarks
 * It renders a standard Radix UI `Callout` with information explaining that
 * changes cannot be made to the current grid. This is typically triggered
 * when a build is loaded from a shared URL or a read-only source.
 *
 * @param {SharedBuildCalloutProps} props - Component properties.
 * @returns {JSX.Element} The callout banner.
 * @see {@link import('./MainAppContent').MainAppContent} The parent component that consumes this callout.
 * @see {@link ./MainAppContent.stories.tsx Storybook}
 * @component
 * @category Components
 * @example
 * ```tsx
 * <SharedBuildCallout gridTableTotalWidth={500} />
 * // mounts a Callout with max-width 500px explaining build is read-only
 * ```
 */
export const SharedBuildCallout: React.FC<SharedBuildCalloutProps> = ({ gridTableTotalWidth }) => {
	return (
		<Box
			flexShrink="0"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
		>
			<Callout.Root mb="3" variant="surface" size="1">
				<Callout.Icon>
					<InfoCircledIcon />
				</Callout.Icon>
				<Callout.Text>
					<span className="text-sm sm:text-base" style={{ color: "var(--gray-12)" }}>
						You are viewing a <strong>Shared Build</strong>. This layout is read-only.
					</span>
				</Callout.Text>
			</Callout.Root>
		</Box>
	);
};
