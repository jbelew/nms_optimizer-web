import type { Meta, StoryObj } from "@storybook/react-vite";

import OptimizationAlertDialog from "./OptimizationAlertDialog";

// Decorator for setting Radix UI theme
const withRadixTheme = (theme: "light" | "dark") => (Story: React.FC) => {
	if (theme === "dark") {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}

	return <Story />;
};

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

export const DefaultLight: Story = {
	args: {
		isOpen: true,
		technologyName: "Hyperdrive",
		onClose: () => console.log("Dialog closed"),
		onForceOptimize: async () => console.log("Force optimize"),
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Optimization Alert Dialog in light mode.",
			},
		},
	},
};

export const DefaultDark: Story = {
	args: {
		isOpen: true,
		technologyName: "Hyperdrive",
		onClose: () => console.log("Dialog closed"),
		onForceOptimize: async () => console.log("Force optimize"),
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Optimization Alert Dialog in dark mode.",
			},
		},
	},
};
