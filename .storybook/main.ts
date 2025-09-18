import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import purgecss from "@fullhuman/postcss-purgecss";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    // "@storybook/addon-vitest"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  async viteFinal(config) {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve(__dirname, "../src"),
      };
    }
    config.css = {
      ...config.css,
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
          purgecss({
            content: [
              './index.html',
              './src/**/*.{js,ts,jsx,tsx}',
            ],
            defaultExtractor: content => content.match(/[\w-/:.]+/g) || [],
            safelist: [/^radix-themes/], // Keep Radix UI classes
          }),
        ],
      },
    };
    return config;
  },
};
export default config;