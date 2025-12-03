import type { Decorator } from "@storybook/react";
import React from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Theme } from "@radix-ui/themes";

import { DialogProvider } from "@/context/DialogContext";

/**
 * Wraps a component with all necessary providers for testing
 */
export const withAllProviders: Decorator = (Story) => (
	<Theme>
		<TooltipProvider>
			<DialogProvider>
				<Story />
			</DialogProvider>
		</TooltipProvider>
	</Theme>
);

/**
 * Wraps a component with dialog provider
 */
export const withDialogProvider: Decorator = (Story) => (
	<DialogProvider>
		<Story />
	</DialogProvider>
);

/**
 * Wraps a component with theme and tooltip providers
 */
export const withThemeAndTooltip: Decorator = (Story) => (
	<Theme>
		<TooltipProvider>
			<Story />
		</TooltipProvider>
	</Theme>
);
