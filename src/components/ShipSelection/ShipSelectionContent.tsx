import React from "react";
import { DropdownMenu } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useShipSelectionContext } from "./useShipSelectionContext";

/**
 * Dropdown content component for ShipSelection.
 */
export const ShipSelectionContent: React.FC = () => {
	const { t } = useTranslation();
	const { groupedShipTypes, handleOptionSelect, selectedShipType } = useShipSelectionContext();

	return (
		<DropdownMenu.Content className="ShipSelection__dropdownMenu">
			<DropdownMenu.Label className="ShipSelection__header heading-styled">
				{t("ShipSelection.selectPlatform", "Select Platform")}
			</DropdownMenu.Label>
			<DropdownMenu.RadioGroup onValueChange={handleOptionSelect} value={selectedShipType}>
				{Object.entries(groupedShipTypes).map(([type, items], groupIndex) => (
					<React.Fragment key={type}>
						{groupIndex > 0 && <DropdownMenu.Separator />}
						{items.map(({ key, label }) => (
							<DropdownMenu.RadioItem className="font-medium" key={key} value={key}>
								{label}
							</DropdownMenu.RadioItem>
						))}
					</React.Fragment>
				))}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	);
};
