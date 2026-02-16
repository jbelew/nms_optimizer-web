// src/components/MainAppContent/SharedBuildCallout.tsx
import React from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Callout } from "@radix-ui/themes";

interface SharedBuildCalloutProps {
	gridTableTotalWidth: number | undefined;
}

/**
 * SharedBuildCallout component displays a warning callout when viewing a shared build.
 * It is rendered above the ship selection heading on shared grids.
 *
 * @param {SharedBuildCalloutProps} props - The props for the component.
 * @returns {JSX.Element} The rendered SharedBuildCallout.
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
