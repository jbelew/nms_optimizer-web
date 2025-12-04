import type { Meta, StoryObj } from "@storybook/react-vite";

import { InstallPrompt } from "./InstallPrompt";

const meta = {
	component: InstallPrompt,
	title: "Components/InstallPrompt",
	parameters: {
		docs: {
			description: {
				component: "Prompt to ask user to install the app as a PWA.",
			},
		},
	},
	decorators: [
		(Story) => {
			return (
				<div
					className="flex min-h-screen items-center justify-center p-4"
					style={{ maxWidth: "800px", margin: "0 auto" }}
				>
					<Story />
				</div>
			);
		},
	],
} satisfies Meta<typeof InstallPrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onDismiss: () => console.log("Install prompt dismissed"),
	},
	parameters: {
		docs: {
			description: {
				story: "Install prompt component.",
			},
		},
		layout: "fullscreen",
	},
};
