import type { Meta, StoryObj } from "@storybook/react-vite";

import AppHeader from "./AppHeader";

const meta = {
	component: AppHeader,
	parameters: {
		docs: {
			description: {
				component:
					"Header component displaying the app title, version, and action buttons for changelog, user stats, language selection, and accessibility toggle.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/AppHeader",
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
	args: {
		onShowChangelog: () => {},
	},
	globals: {
		viewport: {
			isRotated: false,
			value: "desktop",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Header component on desktop.",
			},
		},
	},
};

export const Tablet: Story = {
	args: {
		...Desktop.args,
	},
	globals: {
		viewport: {
			isRotated: false,
			value: "tablet",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Header component on a tablet device.",
			},
		},
	},
};

export const Mobile: Story = {
	args: {
		...Desktop.args,
	},
	globals: {
		viewport: {
			isRotated: false,
			value: "mobile",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Header component on a mobile device.",
			},
		},
	},
};
