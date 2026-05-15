import type { Meta, StoryObj } from "@storybook/react-vite";

import OptimizationAlertDialog from "./OptimizationAlertDialog";

const meta = {
	component: OptimizationAlertDialog,
	decorators: [
		(Story) => {
			return (
				<div
					className="flex min-h-screen items-center justify-center p-4"
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
					"Dialog shown when an optimization process is initiated, allowing users to proceed or force optimization.",
			},
		},
	},
	title: "Components/AppDialog/OptimizationAlert/OptimizationAlertDialog",
} satisfies Meta<typeof OptimizationAlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onClose: () => console.log("Dialog closed"),
		onForceOptimize: async () => console.log("Force optimize"),
		technologyName: "Hyperdrive",
	},
	parameters: {
		docs: {
			description: {
				story: "Optimization Alert Dialog.",
			},
		},
		layout: "fullscreen",
	},
};
