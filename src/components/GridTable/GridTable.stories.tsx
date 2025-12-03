import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { createGrid, useGridStore } from "../../store/GridStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { GridTable } from "./GridTable";

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
	component: GridTable,
	decorators: [
		(Story) => {
			// Initialize stores
			useEffect(() => {
				useGridStore.setState({
					grid: createGrid(10, 6),
					result: null,
					isSharedGrid: false,
					gridFixed: false,
					superchargedFixed: false,
				});
				useTechTreeLoadingStore.setState({
					isLoading: false,
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
} satisfies Meta<typeof GridTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultLight: Story = {
	args: {
		solving: false,
		progressPercent: 0,
		shared: false,
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const DefaultDark: Story = {
	args: {
		solving: false,
		progressPercent: 0,
		shared: false,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const SolvingLight: Story = {
	args: {
		solving: true,
		progressPercent: 45,
		shared: false,
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const SolvingDark: Story = {
	args: {
		solving: true,
		progressPercent: 45,
		shared: false,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};
