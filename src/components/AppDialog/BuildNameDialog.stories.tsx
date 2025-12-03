import type { Meta, StoryObj } from "@storybook/react-vite";

import BuildNameDialog from "./BuildNameDialog";

const meta = {
	component: BuildNameDialog,
	title: "Components/AppDialog/BuildNameDialog",
	parameters: {
		docs: {
			description: {
				component:
					"Modal dialog for entering and confirming a build name when saving a grid configuration.",
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
} satisfies Meta<typeof BuildNameDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onConfirm: (name: string) => console.log("Build saved as:", name),
		onCancel: () => console.log("Cancelled"),
	},
	parameters: {
		docs: {
			description: {
				story: "Build Name Dialog.",
			},
		},
	},
};
