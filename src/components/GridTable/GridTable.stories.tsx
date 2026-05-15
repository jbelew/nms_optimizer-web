import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { createGrid, useGridStore } from "../../store/grid/gridStore";
import { useTechTreeLoadingStore } from "../../store/tech/techTreeLoadingStore";
import { GridTable } from "./GridTable";

const meta = {
	component: GridTable,
	decorators: [
		(Story) => {
			useEffect(() => {
				useGridStore.setState({
					grid: createGrid(10, 6),
					gridFixed: false,
					isSharedGrid: false,
					result: null,
					superchargedFixed: false,
				});
				useTechTreeLoadingStore.setState({
					isLoading: false,
				});
			}, []);

			// Seed Math.random for consistent visual tests
			const originalRandom = Math.random;
			Math.random = () => 0.3;

			return (
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<div
							className="flex min-h-screen items-center justify-center p-4"
							onMouseEnter={() => {
								Math.random = originalRandom;
							}}
							onMouseLeave={() => {
								Math.random = () => 0.3;
							}}
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
				component: "Grid table component for displaying and managing the grid layout.",
			},
		},
	},
	title: "Components/GridTable",
} satisfies Meta<typeof GridTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		sharedGrid: false,
		solving: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Grid table in default state.",
			},
		},
		layout: "fullscreen",
	},
};

export const Solving: Story = {
	args: {
		sharedGrid: false,
		solving: true,
	},
	parameters: {
		docs: {
			description: {
				story: "Grid table with solving state.",
			},
		},
		layout: "fullscreen",
	},
};
