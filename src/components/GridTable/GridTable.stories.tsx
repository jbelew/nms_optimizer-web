import type { Meta, StoryObj } from "@storybook/react-vite";

import { GridTable } from "./GridTable";

const meta = {
	component: GridTable,
	decorators: [
		(Story) => {
			const originalRandom = Math.random;
			Math.random = () => 0.3;

			return (
				<div
					className="flex min-h-screen items-center justify-center p-4"
					onMouseEnter={() => {
						Math.random = originalRandom;
					}}
					onMouseLeave={() => {
						Math.random = () => 0.3;
					}}
					style={{ margin: "0 auto", maxWidth: "800px" }}
				>
					<Story />
				</div>
			);
		},
	],
	parameters: {
		docs: {
			description: {
				component: "Grid table component for displaying and managing the grid layout.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/GridTable",
} satisfies Meta<typeof GridTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		solving: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Grid table in default state.",
			},
		},
	},
};

export const Solving: Story = {
	args: {
		solving: true,
	},
	parameters: {
		docs: {
			description: {
				story: "Grid table with solving state.",
			},
		},
	},
};
