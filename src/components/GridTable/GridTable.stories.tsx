import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { createGrid, useGridStore } from "../../store/GridStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { GridTable } from "./GridTable";

const meta = {
	component: GridTable,
	title: "Components/GridTable",
	parameters: {
		docs: {
			description: {
				component: "Grid table component for displaying and managing the grid layout.",
			},
		},
	},
	decorators: [
		(Story) => {
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

			// Seed Math.random for consistent visual tests
			const originalRandom = Math.random;
			Math.random = () => 0.3;

			return (
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<div
							className="flex min-h-screen items-center justify-center p-4"
							style={{ maxWidth: "800px", margin: "0 auto" }}
							onMouseEnter={() => {
								Math.random = originalRandom;
							}}
							onMouseLeave={() => {
								Math.random = () => 0.3;
							}}
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

export const Default: Story = {
	args: {
		solving: false,
		progressPercent: 0,
		sharedGrid: false,
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
		solving: true,
		progressPercent: 45,
		sharedGrid: false,
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
