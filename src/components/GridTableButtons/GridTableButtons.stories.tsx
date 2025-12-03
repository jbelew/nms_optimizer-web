import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { createGrid, useGridStore } from "../../store/GridStore";
import GridTableButtons from "./GridTableButtons";

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
	component: GridTableButtons,
	title: "Components/GridTableButtons",
	parameters: {
		docs: {
			description: {
				component:
					"Control buttons for grid operations including load/save builds, share grid, reset, and help/about dialogs.",
			},
		},
	},
	decorators: [
		(Story) => {
			useEffect(() => {
				useGridStore.setState({
					isSharedGrid: false,
					grid: createGrid(10, 6),
				});
			}, []);

			return (
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<div
							className="flex min-h-screen items-center justify-center p-4"
							style={{ maxWidth: "800px", margin: "0 auto" }}
						>
							<Story />
						</div>
					</ToastProvider>
					<Toast.Viewport className="ToastViewport" />
				</Toast.Provider>
			);
		},
	],
} satisfies Meta<typeof GridTableButtons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultLight: Story = {
	args: {},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Grid buttons in default state with all controls available.",
			},
		},
	},
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const DefaultDark: Story = {
	args: {},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Grid buttons in default state with all controls available.",
			},
		},
	},
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};
