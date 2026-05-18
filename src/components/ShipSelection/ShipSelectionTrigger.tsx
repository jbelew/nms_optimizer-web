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
	const { isPending } = useShipSelectionContext();

	return (
		<DropdownMenu.Trigger disabled={isPending}>
			<Button
				aria-label={t("ShipSelection.ariaLabel") ?? ""}
				className="p-2!"
				size="2"
				variant="soft"
			>
				<GearIcon className="h-4 w-4 sm:h-5 sm:w-5" />
				<Separator color={isPending ? "gray" : "cyan"} decorative orientation="vertical" />
				<DropdownMenu.TriggerIcon />
			</Button>
		</DropdownMenu.Trigger>
	);
};
