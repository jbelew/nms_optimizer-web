import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";

import { ShipSelection } from "./ShipSelection";

const meta = {
	component: ShipSelection,
	decorators: [
		(Story) => (
			<div className="flex h-screen w-screen items-center justify-center p-4">
				<div className="max-h-full max-w-full overflow-auto">
					<Story />
				</div>
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Dropdown component for selecting Platform Types (Standard, Hauler, Corvette, etc). Manages Platform Type selection and grid reset on change.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/ShipSelection",
} satisfies Meta<typeof ShipSelection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		solving: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Platform Type selection dropdown ready for user interaction.",
			},
		},
	},
};

export const OpenMenu: Story = {
	args: {
		solving: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = await canvas.findByRole("button");
		await userEvent.click(trigger);

		const menu = await screen.findByRole("menu");
		await expect(menu).toBeInTheDocument();
	},
};
