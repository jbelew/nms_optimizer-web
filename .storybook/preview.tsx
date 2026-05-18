/// <reference types="vite/client" />
import type { Decorator, Preview } from "@storybook/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { TooltipProvider } from "@/context/TooltipContext";
import { DialogProvider } from "@/context/dialogContext";
import { I18nextProvider } from "react-i18next";

// Custom viewports matching Tailwind breakpoints
const customViewports = {
	desktop: {
		name: "Desktop (1280px)",
		styles: {
			height: "860px",
			width: "1280px",
		},
		type: "desktop" as const,
	},
	mobile: {
		name: "Mobile (375px)",
		styles: {
			height: "667px",
			width: "384px",
		},
		type: "mobile" as const,
	},
	tablet: {
		name: "Tablet (768px)",
		styles: {
			height: "1024px",
			width: "768px",
		},
		type: "tablet" as const,
	},
};

import i18n from "../src/i18n/i18n";
import { SplashHider } from "./SplashHider";

// Base theme tokens
import "@radix-ui/themes/tokens/base.css";
import "@radix-ui/themes/tokens/colors/cyan.css";
import "@radix-ui/themes/tokens/colors/sage.css";
import "@radix-ui/themes/tokens/colors/purple.css";
import "@radix-ui/themes/tokens/colors/amber.css";
import "@radix-ui/themes/tokens/colors/blue.css";
import "@radix-ui/themes/tokens/colors/crimson.css";
import "@radix-ui/themes/tokens/colors/green.css";
import "@radix-ui/themes/tokens/colors/iris.css";
import "@radix-ui/themes/tokens/colors/jade.css";
import "@radix-ui/themes/tokens/colors/orange.css";
import "@radix-ui/themes/tokens/colors/red.css";
import "@radix-ui/themes/tokens/colors/sky.css";
import "@radix-ui/themes/tokens/colors/teal.css";
import "@radix-ui/themes/tokens/colors/yellow.css";
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
import "@radix-ui/themes/styles.css";
// Main App CSS
import "../src/index.css";
import "../src/components/Toast/Toast.scss";
import "../src/assets/css/fonts.css";

import { StoreResetWrapper, ThemeWrapper } from "./decorators";
import { BackgroundWrapper } from "./BackgroundWrapper";

/**
 *
 */
export const globalTypes = {
	background: {
		defaultValue: "visible",
		description: "Background image visibility",
		toolbar: {
			dynamicTitle: true,
			icon: "image",
			items: [
				{ title: "Visible", value: "visible" },
				{ title: "Hidden", value: "hidden" },
			],
			title: "Background",
		},
	},
	theme: {
		defaultValue: "light",
		description: "Global theme for components",
		toolbar: {
			dynamicTitle: true,
			icon: "circlehollow",
			items: ["light", "dark"],
			title: "Theme",
		},
	},
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

	const theme = context.globals.theme || "dark";

	return (
		<BackgroundWrapper isVisible={isVisible} theme={theme}>
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

const withGlobalProviders: Decorator = (Story, context) => {
	const theme = context.globals.theme || "dark";

	return (
		<BrowserRouter>
			<Theme accentColor="cyan" appearance={theme as "dark" | "light"} panelBackground="solid">
				<TooltipProvider>
					<DialogProvider>
						<SplashHider />
						<I18nextProvider i18n={i18n}>
							<Story />
						</I18nextProvider>
					</DialogProvider>
				</TooltipProvider>
			</Theme>
		</BrowserRouter>
	);
};

// Global mock handling is now in vitest.setup.ts to ensure it catches early resource initialization
const preview: Preview = {
	decorators: [withGlobalProviders, withTheme, withBackground, withStoreReset],
	initialGlobals: {
		background: 'visible',
		theme: 'dark',
		viewport: {
			isRotated: false,
			value: 'desktop',
		},
	},
	parameters: {
		a11y: {
			config: {
				rules: [
					{
						// Disable aria-controls validation for Radix UI components
						// Radix generates dynamic IDs (e.g., radix-_r_1h_) that exist at runtime
						// but can't be verified during static accessibility checks
						id: 'aria-valid-attr-value',
						selector: '[aria-controls^="radix-"]',
					},
					{
						enabled: false,
						// Disable color-contrast checks
						// The app uses a custom theme with intentional color choices
						id: 'color-contrast',
					},
				],
			},
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		viewport: {
			options: customViewports,
		},
	},
};

export default preview;
