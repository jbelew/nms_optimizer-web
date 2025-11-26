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
} satisfies Meta<typeof BuildNameDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
	args: {
		isOpen: true,
		onConfirm: (name: string) => console.log("Build saved as:", name),
		onCancel: () => console.log("Cancelled"),
	},
	parameters: {
		docs: {
			description: {
				story: "Dialog open and ready for user input.",
			},
		},
	},
};
