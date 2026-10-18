import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import NotFound from "./NotFound";

const meta = {
	component: NotFound,
	decorators: [
		(Story) => (
			<div className="mx-auto flex min-h-screen max-w-[800px] items-center justify-center p-4">
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component: "Atlas-themed 404 fallback page displayed for undefined routes.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/NotFound",
} satisfies Meta<typeof NotFound>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const heading = await canvas.findByRole("heading", { level: 1 });
		await expect(heading).toBeInTheDocument();
		const returnButton = await canvas.findByRole("button");
		await expect(returnButton).toBeInTheDocument();
	},
};
