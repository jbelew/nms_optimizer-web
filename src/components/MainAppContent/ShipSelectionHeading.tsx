// src/components/MainAppContent/ShipSelectionHeading.tsx
import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ShipSelection } from "../ShipSelection/ShipSelection";

/**
 * Props for the `ShipSelectionHeading` component.
 *
 * @category Components
 */
interface ShipSelectionHeadingProps {
	/** Whether the grid is in read-only shared mode. */
	isSharedGrid: boolean;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
	/**
	 * The internal identifier of the currently selected ship type.
	 *
	 * Must be a valid key in the localization files (e.g., "solar", "explorer").
	 */
	selectedShipType: string;
	/**
	 * Total width of the grid table in pixels.
	 *
	 * Used for responsive max-width alignment of the heading container.
	 */
	gridTableTotalWidth: number | undefined;
}

/**
 * A layout component that displays the current equipment platform and its selection control.
 *
 * @remarks
 * It renders the localized platform labels (e.g., "Starship: Solar") and, if not in
 * shared mode, the interactive `ShipSelection` dropdown. It adjusts its opacity
 * while a solve is in progress to provide visual feedback.
 *
 * @param {ShipSelectionHeadingProps} props - Component properties.
 *
 * @returns {JSX.Element} The header section above the grid.
 *
 * @see {@link import('./MainAppContent').MainAppContent} The parent component that manages the layout.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShipSelectionHeading
 *   isSharedGrid={false}
 *   solving={false}
 *   selectedShipType="solar"
 *   gridTableTotalWidth={500}
 * />
 * // mounts heading: "Starship: Solar" with ShipSelection dropdown
 * ```
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
