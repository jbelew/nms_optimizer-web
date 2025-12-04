// Browser-compatible preview that can be loaded in vitest setup
// This file contains the decorators and configuration needed for story tests

import type { Decorator, Preview } from "@storybook/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { I18nextProvider } from "react-i18next";

import i18n from "../src/i18n/i18n";
import { DialogProvider } from "../src/context/DialogContext";
import { StoreResetWrapper, ThemeWrapper } from "./decorators";

// Minimal stub for SplashscreenHider to avoid importing assets
const SplashscreenHider = () => null;

// Minimal stub for BackgroundWrapper to avoid webp import issues in test environment
const BackgroundWrapper: React.FC<{ isVisible: boolean; children: React.ReactNode }> = ({ children }) => {
	return <>{children}</>;
};

const withTheme: Decorator = (Story, context) => {
	return (
		<ThemeWrapper theme={context.globals.theme}>
			<Story />
		</ThemeWrapper>
	);
};

const withBackground: Decorator = (Story, context) => {
	const isVisible = context.globals.background === "visible";

	return (
		<BackgroundWrapper isVisible={isVisible}>
			<Story />
		</BackgroundWrapper>
	);
};

const withStoreReset: Decorator = (Story) => {
	return (
		<StoreResetWrapper>
			<Story />
		</StoreResetWrapper>
	);
};

const withGlobalProviders: Decorator = (Story) => {
	return (
		<BrowserRouter>
			<Theme accentColor="cyan">
				<TooltipProvider>
					<DialogProvider>
						<SplashscreenHider />
						<I18nextProvider i18n={i18n}>
							<Story />
						</I18nextProvider>
					</DialogProvider>
				</TooltipProvider>
			</Theme>
		</BrowserRouter>
	);
};

export const globalTypes = {
	theme: {
		description: "Global theme for components",
		defaultValue: "light",
		toolbar: {
			title: "Theme",
			icon: "circlehollow",
			items: ["light", "dark"],
			dynamicTitle: true,
		},
	},
	background: {
		description: "Background image visibility",
		defaultValue: "visible",
		toolbar: {
			title: "Background",
			icon: "image",
			items: [
				{ value: "visible", title: "Visible" },
				{ value: "hidden", title: "Hidden" },
			],
			dynamicTitle: true,
		},
	},
};

const preview: Preview = {
	decorators: [withGlobalProviders, withTheme, withBackground, withStoreReset],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		a11y: {
			config: {
				rules: [
					{
						id: 'aria-valid-attr-value',
						selector: '[aria-controls^="radix-"]',
					},
					{
						id: 'color-contrast',
						enabled: false,
					},
				],
			},
		},
	},
	initialGlobals: {
		viewport: {
			value: 'desktop',
			isRotated: false,
		},
		theme: 'dark',
		background: 'hidden',
	},
};

export default preview;
