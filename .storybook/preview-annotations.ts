// This file contains only the annotations that can be safely imported in browser environment
// It re-exports the globalTypes and parameters from preview without importing heavy dependencies

export const globalTypes = {
	theme: {
		description: "Global theme for components",
		defaultValue: "light",
		toolbar: {
			title: "Theme",
			icon: "circlehollow",
			items: ["light", "dark"],
			dynamicTitle: true,
		},
	},
	background: {
		description: "Background image visibility",
		defaultValue: "visible",
		toolbar: {
			title: "Background",
			icon: "image",
			items: [
				{ value: "visible", title: "Visible" },
				{ value: "hidden", title: "Hidden" },
			],
			dynamicTitle: true,
		},
	},
};

export const parameters = {
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
					id: 'aria-valid-attr-value',
					selector: '[aria-controls^="radix-"]',
				},
				{
					id: 'color-contrast',
					enabled: false,
				},
			],
		},
	},
	initialGlobals: {
		viewport: {
			value: 'desktop',
			isRotated: false,
		},
		theme: 'dark',
		background: 'hidden',
	},
};
