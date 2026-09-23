import React from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useShipSelectionContext } from "./useShipSelectionContext";

/**
 * Trigger component for ShipSelection.
 */
export const ShipSelectionTrigger: React.FC = () => {
	const { t } = useTranslation();
	const { disabled, isPending } = useShipSelectionContext();
	const isDisabled = disabled || isPending;

	return (
		<DropdownMenu.Trigger disabled={isDisabled}>
			<Button
				aria-label={t("shipSelection.ariaLabel") ?? ""}
				className="p-2!"
				size="2"
				variant="soft"
			>
				<GearIcon className="h-4 w-4 sm:h-5 sm:w-5" />
				<Separator color={isDisabled ? "gray" : "cyan"} decorative orientation="vertical" />
				<DropdownMenu.TriggerIcon />
			</Button>
		</DropdownMenu.Trigger>
	);
};
