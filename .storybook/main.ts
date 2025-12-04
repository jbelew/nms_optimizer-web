import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { splashScreen } from 'vite-plugin-splash-screen';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  staticDirs: ["../public"],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/react-vite",
  async viteFinal(config, { configType }) {
    // Skip splash screen plugin during tests
    if (configType === 'DOCUMENTATION') {
      return mergeConfig(config, {
        plugins: [
          splashScreen({
            logoSrc: "assets/svg/loader.svg",
            splashBg: "#000000",
            loaderBg: "#00A2C7",
            loaderType: "dots",
          }),
        ],
      });
    }

    return config;
  },
};

export default config;
