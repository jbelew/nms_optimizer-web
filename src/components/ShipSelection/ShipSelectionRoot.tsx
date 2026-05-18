import React from "react";
import { DropdownMenu } from "@radix-ui/themes";

/**
 * Root component for ShipSelection.
 */
export const ShipSelectionRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <DropdownMenu.Root>{children}</DropdownMenu.Root>;
};
