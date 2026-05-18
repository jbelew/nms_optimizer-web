import React, { Suspense } from "react";
import { Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import {
	ShipSelectionContent,
	ShipSelectionProvider,
	ShipSelectionRoot,
	ShipSelectionSkeleton,
	ShipSelectionTrigger,
} from "@/components/ShipSelection/shipSelection";

import { useMainAppGlobal, useMainAppLayout, useMainAppOptimization } from "./useMainAppContext";

/**
 * A layout component that displays the current equipment platform and its selection control.
 */
export const ShipSelectionHeading: React.FC = () => {
	const { t } = useTranslation();
	const { gridTableTotalWidth } = useMainAppLayout();
	const { isSharedGrid, selectedShipType } = useMainAppGlobal();
	const { solving } = useMainAppOptimization();

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
			{!isSharedGrid && (
				<span className="main-app__ship-selection">
					<Suspense fallback={<ShipSelectionSkeleton />}>
						<ShipSelectionProvider solving={solving}>
							<ShipSelectionRoot>
								<ShipSelectionTrigger />
								<ShipSelectionContent />
							</ShipSelectionRoot>
						</ShipSelectionProvider>
					</Suspense>
				</span>
			)}

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
				{t(`platforms.${selectedShipType}`)}
			</Text>
		</Flex>
	);
};
