import type { Meta, StoryObj } from "@storybook/react-vite";

import UpdatePrompt from "./UpdatePrompt";

const meta = {
	component: UpdatePrompt,
	parameters: {
		layout: "fullscreen",
	},
	title: "components/UpdatePrompt",
} satisfies Meta<typeof UpdatePrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onDismiss: () => console.log("Dismiss clicked"),
		onRefresh: () => console.log("Refresh clicked"),
	},
};
