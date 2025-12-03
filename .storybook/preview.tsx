import type { Decorator, Preview } from "@storybook/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { I18nextProvider } from "react-i18next";

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
            viewports: {
                desktop: {
                    name: 'Desktop',
                    styles: {
                        width: '1024px',
                        height: '768px',
                    },
                },
                ipad: {
                    name: 'iPad',
                    styles: {
                        width: '768px',
                        height: '1024px',
                    },
                },
                mobile1: {
                    name: 'Mobile',
                    styles: {
                        width: '375px',
                        height: '667px',
                    },
                },
            },
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
