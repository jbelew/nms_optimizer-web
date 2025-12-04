import type { Meta, StoryObj } from "@storybook/react-vite";

import OptimizationAlertDialog from "./OptimizationAlertDialog";

const meta = {
	component: OptimizationAlertDialog,
	title: "Components/AppDialog/OptimizationAlertDialog",
	parameters: {
		docs: {
			description: {
				component:
					"Dialog shown when an optimization process is initiated, allowing users to proceed or force optimization.",
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
} satisfies Meta<typeof OptimizationAlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		technologyName: "Hyperdrive",
		onClose: () => console.log("Dialog closed"),
		onForceOptimize: async () => console.log("Force optimize"),
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
