// src/components/MainAppContent/ShipSelectionHeading.tsx
import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ShipSelection } from "../ShipSelection/ShipSelection";

interface ShipSelectionHeadingProps {
	isSharedGrid: boolean;
	solving: boolean;
	selectedShipType: string;
	gridTableTotalWidth: number | undefined;
}

/**
 * ShipSelectionHeading component renders the ship selector (if not shared) and current platform labels.
 *
 * @param {ShipSelectionHeadingProps} props - The props for the component.
 * @returns {JSX.Element} The rendered ShipSelectionHeading.
 */
export const ShipSelectionHeading: React.FC<ShipSelectionHeadingProps> = ({
	isSharedGrid,
	solving,
	selectedShipType,
	gridTableTotalWidth,
}) => {
	const { t } = useTranslation();

	return (
		<Flex
			align="center"
			wrap="wrap"
			gap="3"
			className="main-app__ship-selector heading-styled"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
		>
			{!isSharedGrid && (
				<span className="main-app__ship-selection">
					<ShipSelection solving={solving} />
				</span>
			)}

			<Text
				trim="end"
				className="main-app__ship-label"
				style={{ opacity: solving ? 0.365 : 1 }}
			>
				{t("platformLabel")}
			</Text>
			<Text
				trim="end"
				className="main-app__ship-name trim-text"
				style={{ opacity: solving ? 0.365 : 1 }}
			>
				{t(`platforms.${selectedShipType}`)}
			</Text>
		</Flex>
	);
};
