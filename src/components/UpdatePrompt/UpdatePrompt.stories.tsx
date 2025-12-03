import type { Meta, StoryObj } from "@storybook/react-vite";

import UpdatePrompt from "./UpdatePrompt";

const meta = {
	component: UpdatePrompt,
	title: "components/UpdatePrompt",
} satisfies Meta<typeof UpdatePrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onRefresh: () => console.log("Refresh clicked"),
		onDismiss: () => console.log("Dismiss clicked"),
	},
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};
