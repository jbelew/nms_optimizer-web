import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { splashScreen } from 'vite-plugin-splash-screen';

const config: StorybookConfig = {
  "stories": [
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
  "typescript": {
    reactDocgen: 'react-docgen',
  },
  async viteFinal(config, { configType }) {
    const isTest = process.env.NODE_ENV === 'test';
    const isProduction = configType === 'PRODUCTION';

    const mergedConfig = mergeConfig(config, {
      define: {
        '__APP_VERSION__': JSON.stringify('1.0.0-test'),
        '__BUILD_DATE__': JSON.stringify('2025-01-01T00:00:00.000Z'),
        'import.meta.env.VITE_BUILD_VERSION': JSON.stringify('1.0.0-test'),
      },
      plugins: [
        ...(!isTest && !isProduction ? [
          splashScreen({
            logoSrc: "assets/svg/loader.svg",
            splashBg: "#000000",
            loaderBg: "#00A2C7",
            loaderType: "dots",
          }),
        ] : []),
      ],
    });

    return mergedConfig;
  },
};

export default config;
