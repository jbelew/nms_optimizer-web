import type { Decorator, Preview } from "@storybook/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { I18nextProvider } from "react-i18next";

// Custom viewports matching Tailwind breakpoints
const customViewports = {
	mobile: {
		name: "Mobile (375px)",
		styles: {
			width: "384px",
			height: "667px",
		},
		type: "mobile" as const,
	},
	tablet: {
		name: "Tablet (768px)",
		styles: {
			width: "768px",
			height: "1024px",
		},
		type: "tablet" as const,
	},
	desktop: {
		name: "Desktop (1280px)",
		styles: {
			width: "1280px",
			height: "860px",
		},
		type: "desktop" as const,
	},
};

import i18n from "../src/i18n/i18n";
import { DialogProvider } from "../src/context/DialogContext";
import { SplashscreenHider } from "../src/utils/SplashscreenHider";

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

const preview: Preview = {
	decorators: [withGlobalProviders],
	parameters: {
		viewport: {
			options: customViewports,
		},
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
						// Disable aria-controls validation for Radix UI components
						// Radix generates dynamic IDs (e.g., radix-_r_1h_) that exist at runtime
						// but can't be verified during static accessibility checks
						id: 'aria-valid-attr-value',
						selector: '[aria-controls^="radix-"]',
					},
					{
						// Disable color-contrast checks
						// The app uses a custom theme with intentional color choices
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
	},
};

export default preview;
