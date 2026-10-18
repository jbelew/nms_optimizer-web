import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "@/hooks/useToast/useToast";
import { createGrid, useGridStore } from "@/store/grid/gridStore";

import GridTableButtons from "./GridTableButtons";

const meta: Meta<typeof GridTableButtons> = {
	component: GridTableButtons,
	decorators: [
		(Story) => {
			useEffect(() => {
				useGridStore.setState({
					grid: createGrid(10, 6),
					isSharedGrid: false,
				});
			}, []);

			return (
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<div
							className="main-app__grid-section flex min-h-screen items-center justify-center p-4"
							style={{ margin: "0 auto", maxWidth: "800px" }}
						>
							<Story />
						</div>
					</ToastProvider>
					<Toast.Viewport className="ToastViewport" />
				</Toast.Provider>
			);
		},
	],
	parameters: {
		docs: {
			description: {
				component:
					"Control buttons for grid operations including load/save builds, share grid, reset, and help/about dialogs.",
			},
		},
	},
	title: "Components/GridTableButtons",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		solving: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Grid buttons in default state with all controls available.",
			},
		},
		layout: "fullscreen",
	},
};
