module.exports = {
  plugins: [
    require('@tailwindcss/postcss'), // Tailwind directives
    require('autoprefixer'),          // vendor prefixes
    require('@fullhuman/postcss-purgecss')({
      content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
      ],
      defaultExtractor: content => content.match(/[\w-/:.]+/g) || [],
      safelist: [
        /^radix-themes/, // keep all Radix theme classes
        /^radix-/        // optional: cover any other Radix UI classes
      ],
    }),
  ],
};
