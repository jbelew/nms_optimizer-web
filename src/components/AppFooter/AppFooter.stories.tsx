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
	},
} satisfies Meta<typeof AppFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
	args: {
		buildVersion: "6.1.2",
		buildDate: "2024-11-25T15:30:00Z",
	},
	parameters: {
		docs: {
			description: {
				story: "Footer with version and build date displayed.",
			},
		},
	},
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const Tablet: Story = {
	args: {
		...Desktop.args,
	},
	render: Desktop.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad).",
			},
		},
	},
	globals: {
		viewport: {
			value: "tablet",
			isRotated: false,
		},
	},
};

export const Mobile: Story = {
	args: {
		...Desktop.args,
	},
	render: Desktop.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a mobile device.",
			},
		},
	},
	globals: {
		viewport: {
			value: "mobile",
			isRotated: false,
		},
	},
};
