import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";

import { LanguageSelector } from "./LanguageSelector";

const meta = {
	component: LanguageSelector,
	decorators: [
		(Story) => (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component: "Dropdown menu for switching the active application locale.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/LanguageSelector",
} satisfies Meta<typeof LanguageSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OpenMenu: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = await canvas.findByRole("button");
		await userEvent.click(trigger);

		const menu = await screen.findByRole("menu");
		await expect(menu).toBeInTheDocument();
	},
};
