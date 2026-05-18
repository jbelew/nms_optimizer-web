import React from "react";
import { Button, DropdownMenu, IconButton, Separator, Spinner } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

/**
 * A skeleton component that mimics the `ShipSelection` trigger button.
 */
export const ShipSelectionSkeleton = () => {
	const { t } = useTranslation();
	const isSmallAndUp = useBreakpoint("640px");

	return (
		<>
			{isSmallAndUp ? (
				<Button
					aria-label={t("ShipSelection.ariaLabel") ?? ""}
					className="p-2!"
					disabled
					size="2"
					variant="soft"
				>
					<Spinner size="3" />
					<Separator color="gray" decorative orientation="vertical" />
					<DropdownMenu.TriggerIcon />
				</Button>
			) : (
				<IconButton
					aria-label={t("ShipSelection.ariaLabel") ?? ""}
					className="mt-1!"
					disabled
					size="2"
					variant="soft"
				>
					<Spinner size="3" />
				</IconButton>
			)}
		</>
	);
};
