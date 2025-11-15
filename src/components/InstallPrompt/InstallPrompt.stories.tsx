import type { Meta, StoryObj } from "@storybook/react-vite";

import { InstallPrompt } from "./InstallPrompt";

const meta = {
	component: InstallPrompt,
	title: "components/InstallPrompt",
} satisfies Meta<typeof InstallPrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onDismiss: () => console.log("Install prompt dismissed"),
	},
};
