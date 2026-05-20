import React from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Callout } from "@radix-ui/themes";
import { Trans } from "react-i18next";

import { useMainAppLayout } from "./useMainAppContext";

/**
 * A notification component that appears when the user is viewing a read-only shared layout.
 */
export const SharedBuildCallout: React.FC = () => {
	const { gridTableTotalWidth } = useMainAppLayout();

	return (
		<Box
			flexShrink="0"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
		>
			<Callout.Root mb="3" size="1" variant="surface">
				<Callout.Icon>
					<InfoCircledIcon />
				</Callout.Icon>
				<Callout.Text>
					<span className="text-sm sm:text-base" style={{ color: "var(--gray-12)" }}>
						<Trans i18nKey="mainApp.viewingSharedBuild" />
					</span>
				</Callout.Text>
			</Callout.Root>
		</Box>
	);
};
