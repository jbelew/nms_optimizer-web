import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, within } from "storybook/test";

import { useOptimizeStore } from "@/store/ui/uiStore";

import { ErrorDialog } from "./ErrorDialog";

const meta = {
	component: ErrorDialog,
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
	title: "Components/AppDialog/Error/ErrorDialog",
} satisfies Meta<typeof ErrorDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onClose: () => {},
	},
	decorators: [
		(Story) => {
			useOptimizeStore.setState({
				status: {
					details: new Error("Test error message from Storybook"),
					severity: "recoverable",
					type: "error",
				},
			});

			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: "Error Dialog displaying a server error message and error details.",
			},
		},
		layout: "fullscreen",
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
		await expect(
			within(dialog).getAllByText(/Test error message from Storybook/i).length,
		).toBeGreaterThan(0);
	},
};
