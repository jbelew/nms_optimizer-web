import type { Meta, StoryObj } from "@storybook/react-vite";

import AppFooter from "./AppFooter";

const meta = {
	component: AppFooter,
	title: "Components/AppFooter",
	decorators: [
		(Story) => (
			<div className="flex items-center justify-center">
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Footer component displaying build version, build date, social links, and support options.",
			},
		},
		layout: "fullscreen",
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
	},
} satisfies Meta<typeof AppFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
	args: {
		buildVersion: "6.1.2",
		buildDate: "2024-11-25T15:30:00Z",
	},
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Footer on desktop.",
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
			value: "tablet",
			isRotated: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Footer on a tablet device.",
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
			value: "mobile",
			isRotated: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Footer on a mobile device.",
			},
		},
	},
};
