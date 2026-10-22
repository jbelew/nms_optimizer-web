import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import WelcomeDialog from "./WelcomeDialog";

const meta = {
	component: WelcomeDialog,
	decorators: [
		(Story) => (
			<div
				className="flex min-h-screen items-center justify-center p-4"
				style={{ margin: "0 auto", maxWidth: "800px" }}
			>
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Initial onboarding dialog introducing core workspace interactions and terminology.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/AppDialog/Welcome/WelcomeDialog",
} satisfies Meta<typeof WelcomeDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onClose: () => {},
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
	},
};
