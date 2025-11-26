import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { createGrid, useGridStore } from "../../store/GridStore";
import GridTableButtons from "./GridTableButtons";

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
						<Story />
					</ToastProvider>
					<Toast.Viewport className="ToastViewport" />
				</Toast.Provider>
			);
		},
	],
} satisfies Meta<typeof GridTableButtons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story: "Grid buttons in default state with all controls available.",
			},
		},
	},
};
