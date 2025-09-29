import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	staticDirs: ["../public"],
	addons: [
		"@chromatic-com/storybook",
		    "@storybook/addon-docs",
		    "@storybook/addon-a11y",
		    "@storybook/addon-interactions",
		    		// "@storybook/addon-vitest"
		    	],	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
};
export default config;