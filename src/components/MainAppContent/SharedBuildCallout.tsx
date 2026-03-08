// src/components/MainAppContent/SharedBuildCallout.tsx
import React from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Callout } from "@radix-ui/themes";

/**
 * Props for the `SharedBuildCallout` component.
 */
interface SharedBuildCalloutProps {
	/** Total width of the grid table, used to align the callout's max-width. */
	gridTableTotalWidth: number | undefined;
}

/**
 * A notification component that appears when the user is viewing a read-only shared layout.
 *
 * It renders a standard Radix UI `Callout` with information explaining that
 * changes cannot be made to the current grid.
 *
 * @param {SharedBuildCalloutProps} props - Component properties.
 * @returns {JSX.Element} The rendered callout component.
 *
 * @example
 * <SharedBuildCallout gridTableTotalWidth={500} />
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
