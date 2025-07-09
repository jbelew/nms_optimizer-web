module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}", // Adjust to your file types
	],
	theme: {
		extend: {},
	},
	plugins: [],
	safelist: [
		{ pattern: /data-state-.*/ },
		{ pattern: /data-side-.*/ },
	],
};
