import type { Meta, StoryObj } from "@storybook/react-vite";

import BuildNameDialog from "./BuildNameDialog";

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

export const DefaultLight: Story = {
	args: {
		isOpen: true,
		onConfirm: (name: string) => console.log("Build saved as:", name),
		onCancel: () => console.log("Cancelled"),
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Build Name Dialog in light mode.",
			},
		},
	},
};

export const DefaultDark: Story = {
	args: {
		isOpen: true,
		onConfirm: (name: string) => console.log("Build saved as:", name),
		onCancel: () => console.log("Cancelled"),
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Build Name Dialog in dark mode.",
			},
		},
	},
};
