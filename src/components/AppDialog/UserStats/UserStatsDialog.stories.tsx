import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor } from "storybook/test";

import UserStatsDialog from "./UserStatsDialog";

const meta = {
	component: UserStatsDialog,
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
					"Routed Dialog displaying aggregate user optimization statistics across Platform Types.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/AppDialog/UserStats/UserStatsDialog",
} satisfies Meta<typeof UserStatsDialog>;

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
				const headings = screen.getAllByRole("heading", { level: 2 });
				await expect(headings.length).toBeGreaterThanOrEqual(2);
			},
			{ timeout: 5000 },
		);
	},
};
