import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { UpdatePrompt } from "./UpdatePromptDialog";

const meta = {
	component: UpdatePrompt,
	parameters: {
		layout: "fullscreen",
	},
	title: "Components/UpdatePrompt",
} satisfies Meta<typeof UpdatePrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onDismiss: () => {},
		onRefresh: () => {},
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
	},
};
