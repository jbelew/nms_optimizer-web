import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor } from "storybook/test";

import PerformanceDialog from "./PerformanceDialog";

const meta = {
	component: PerformanceDialog,
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
					"Routed Dialog displaying aggregate Core Web Vitals and performance metrics.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/AppDialog/Performance/PerformanceDialog",
} satisfies Meta<typeof PerformanceDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onClose: () => {},
	},
	play: async () => {
		await waitFor(
			async () => {
				await expect(screen.getByRole("dialog")).toBeInTheDocument();
				await expect(screen.getByRole("radio", { name: /3d/i })).toBeInTheDocument();
			},
			{ timeout: 5000 },
		);
	},
};
