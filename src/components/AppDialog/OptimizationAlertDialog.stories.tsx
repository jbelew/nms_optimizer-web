import type { Meta, StoryObj } from "@storybook/react-vite";

import OptimizationAlertDialog from "./OptimizationAlertDialog";

const meta = {
	component: OptimizationAlertDialog,
	title: "components/AppDialog/OptimizationAlertDialog",
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
};

export const WithDifferentTech: Story = {
	args: {
		isOpen: true,
		technologyName: "Shield Generator",
		onClose: () => console.log("Dialog closed"),
		onForceOptimize: async () => console.log("Force optimize"),
	},
};
