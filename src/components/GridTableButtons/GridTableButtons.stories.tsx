import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect, useRef } from "react";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { createGrid, useGridStore } from "../../store/grid/gridStore";
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

			const gridRef = useRef<HTMLDivElement>(null);

			return (
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<div
							className="flex min-h-screen items-center justify-center p-4"
							ref={gridRef}
							style={{ margin: "0 auto", maxWidth: "800px" }}
						>
							<Story args={{ gridRef }} />
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
		gridRef: { current: null },
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
