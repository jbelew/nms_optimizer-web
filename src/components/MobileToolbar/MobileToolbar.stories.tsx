import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "@/hooks/useToast/useToast";
import { useGridStore } from "@/store/grid/gridStore";
import { useOptimizeStore } from "@/store/ui/uiStore";

import { MobileToolbar } from "./MobileToolbar";

const meta = {
	component: MobileToolbar,
	decorators: [
		(Story) => {
			useEffect(() => {
				useGridStore.setState({
					hasModulesInGrid: true,
					isSharedGrid: false,
				});
				useOptimizeStore.setState({
					status: { type: "idle" },
				});
			}, []);

			return (
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<div
							className="flex min-h-screen items-center justify-center p-4"
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
				component: "Mobile toolbar for grid operations and utility actions.",
			},
		},
	},
	title: "Components/MobileToolbar",
} satisfies Meta<typeof MobileToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: "Mobile Toolbar with controls for grid operations.",
			},
		},
		layout: "fullscreen",
	},
};
