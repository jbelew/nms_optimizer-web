import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { ToastRenderer } from "../Toast/ToastRenderer";
import { InstallPrompt } from "./InstallPrompt";

const meta = {
	component: InstallPrompt,
	decorators: [
		(Story) => {
			// Seed localStorage so the component thinks this is a return visit
			localStorage.setItem("userVisited", "true");
			localStorage.removeItem("installPromptDismissed");

			// Mock touch device so isTouchDevice() returns true
			Object.defineProperty(navigator, "maxTouchPoints", {
				configurable: true,
				value: 1,
				writable: true,
			});

			return (
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<div
							className="flex min-h-screen items-center justify-center p-4"
							style={{ margin: "0 auto", maxWidth: "800px" }}
						>
							<Story />
							<ToastRenderer />
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
				component: "Prompt to ask user to install the app as a PWA.",
			},
		},
	},
	title: "Components/InstallPrompt",
} satisfies Meta<typeof InstallPrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: "Install prompt component. Displays a toast notification prompting users to install the app, shown only on touch devices after the first visit (if not already installed).",
			},
		},
		layout: "fullscreen",
	},
};
