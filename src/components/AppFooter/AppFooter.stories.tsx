import type { Meta, StoryObj } from "@storybook/react-vite";

import AppFooter from "./AppFooter";

const meta = {
	component: AppFooter,
	decorators: [
		(Story) => (
			<div className="flex items-center justify-center">
				<Story />
			</div>
		),
	],
	parameters: {
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
		docs: {
			description: {
				component:
					"Footer component displaying build version, build date, social links, and support options.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/AppFooter",
} satisfies Meta<typeof AppFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
	args: {
		buildDate: "2024-11-25T15:30:00Z",
		buildVersion: "6.1.2",
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
			isRotated: false,
			value: "tablet",
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
			isRotated: false,
			value: "mobile",
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
