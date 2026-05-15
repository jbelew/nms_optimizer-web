import type { Meta, StoryObj } from "@storybook/react-vite";

import BuildNameDialog from "./BuildNameDialog";

const meta = {
	component: BuildNameDialog,
	decorators: [
		(Story) => {
			// Seed Math.random for consistent visual tests
			const originalRandom = Math.random;
			Math.random = () => 0.5;

			return (
				<div
					className="flex min-h-screen items-center justify-center p-4"
					onMouseEnter={() => {
						Math.random = originalRandom;
					}}
					onMouseLeave={() => {
						Math.random = () => 0.5;
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
				component:
					"Modal dialog for entering and confirming a build name when saving a grid configuration.",
			},
		},
	},
	title: "Components/AppDialog/BuildName/BuildNameDialog",
} satisfies Meta<typeof BuildNameDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onCancel: () => console.log("Cancelled"),
		onConfirm: (name: string) => console.log("Build saved as:", name),
	},
	parameters: {
		docs: {
			description: {
				story: "Build Name Dialog.",
			},
		},
		layout: "fullscreen",
	},
};
