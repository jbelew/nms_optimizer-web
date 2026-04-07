import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { ShipSelection } from "./ShipSelection";

const meta = {
	component: ShipSelection,
	title: "Components/ShipSelection",
	parameters: {
		docs: {
			description: {
				component:
					"Dropdown component for selecting ship types (Standard, Hauler, Corvette, etc). Manages platform selection and grid reset on change.",
			},
		},
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<Toast.Provider swipeDirection="right">
				<ToastProvider>
					<div className="flex h-screen w-screen items-center justify-center p-4">
						<div className="max-h-full max-w-full overflow-auto">
							<Story />
						</div>
					</div>
				</ToastProvider>
				<Toast.Viewport className="ToastViewport" />
			</Toast.Provider>
		),
	],
	loaders: [
		async () => {
			try {
				const response = await fetch(
					"https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/platforms"
				);

				if (!response.ok) {
					throw new Error(`API responded with status ${response.status}`);
				}

				const shipTypes = await response.json();

				return { shipTypes };
			} catch (error) {
				console.error("Failed to load ship types for Storybook:", error);

				return { shipTypes: {} };
			}
		},
	],
} satisfies Meta<typeof ShipSelection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		solving: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Ship selection dropdown ready for user interaction.",
			},
		},
	},
};
