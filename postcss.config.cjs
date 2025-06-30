module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
    require('@fullhuman/postcss-purgecss')({
      content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
      ],
      defaultExtractor: content => content.match(/[\w-/:.]+/g) || [],
      safelist: [/^radix-themes/], // Keep Radix UI classes
    }),
  ],
};