import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ShipSelection } from "@/components/ShipSelection/ShipSelection";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useOptimizeStore, useUiStore } from "@/store/ui/uiStore";

/**
 * A layout component that displays the current equipment platform and its selection control.
 *
 * @returns {JSX.Element} The rendered platform selector heading.
 *
 * @see {@link ShipSelection}
 * @see {@link ./MainAppLayout.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShipSelectionHeading />
 * // renders platform selector dropdown and active platform label
 * ```
 */
export const ShipSelectionHeading: React.FC = () => {
	const { t } = useTranslation();
	const gridTableTotalWidth = useUiStore((state) => state.gridTableWidth);
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);
	const solving = useOptimizeStore((state) => state.status.type === "solving");

	return (
		<Flex
			align="center"
			className="main-app__ship-selector heading-styled"
			gap="3"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
			wrap="wrap"
		>
			<span className="main-app__ship-selection">
				<ShipSelection disabled={isSharedGrid} solving={solving} />
			</span>

			<Text
				className="main-app__ship-label"
				style={{ opacity: solving ? 0.365 : 1 }}
				trim="end"
			>
				{t("platformLabel")}
			</Text>
			<Text
				className="main-app__ship-name trim-text"
				style={{ opacity: solving ? 0.365 : 1 }}
				trim="end"
			>
				{t(`platforms.${selectedPlatform}`)}
			</Text>
		</Flex>
	);
};
