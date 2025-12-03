import type { Meta, StoryObj } from "@storybook/react-vite";

import AppFooter from "./AppFooter";

const meta = {
	component: AppFooter,
	title: "Components/AppFooter",
	decorators: [
		(Story) => (
			<div className="flex h-screen w-screen items-center justify-center p-6">
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

export const Default: Story = {
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
};
