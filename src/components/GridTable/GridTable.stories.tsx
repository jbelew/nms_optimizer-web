import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { createGrid, useGridStore } from "../../store/GridStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { withThemeAndTooltip } from "../../stories/decorators";
import { GridTable } from "./GridTable";

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
		withThemeAndTooltip,
	],
} satisfies Meta<typeof GridTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		solving: false,
		progressPercent: 0,
		shared: false,
	},
};

export const Solving: Story = {
	args: {
		solving: true,
		progressPercent: 45,
		shared: false,
	},
};
