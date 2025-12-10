import type { Meta, StoryObj } from "@storybook/react-vite";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { InstallPrompt } from "./InstallPrompt";

const meta = {
	component: InstallPrompt,
	title: "Components/InstallPrompt",
	parameters: {
		docs: {
			description: {
				component: "Prompt to ask user to install the app as a PWA.",
			},
		},
	},
	decorators: [
		(Story) => {
			return (
				<ToastProvider>
					<div
						className="flex min-h-screen items-center justify-center p-4"
						style={{ maxWidth: "800px", margin: "0 auto" }}
					>
						<Story />
					</div>
				</ToastProvider>
			);
		},
	],
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
