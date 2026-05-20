import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "@/hooks/useToast/useToast";
import i18n from "@/i18n/i18n";
import { usePlatformStore } from "@/store/app/platformStore";

import { ShipSelection } from "./ShipSelection";

// Pre-load essential translation keys for the interaction test
// This ensures the test passes in headless environments where the HTTP backend might not load
i18n.addResourceBundle(
	"en",
	"translation",
	{
		platforms: {
			corvette: "Corvettes",
		},
		ShipSelection: {
			selectPlatform: "Select Platform",
		},
	},
	true,
	true
);

const meta = {
	component: ShipSelection,
	decorators: [
		(Story) => {
			// Ensure we have a clean state for the store
			usePlatformStore.setState({ selectedPlatform: "standard" });

			return (
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
			);
		},
	],
	loaders: [
		async () => {
			try {
				const response = await fetch("https://api.nms-optimizer.app/platforms");

				if (!response.ok) {
					throw new Error(`API responded with status ${response.status}`);
				}

				const shipTypes = await response.json();

				return { shipTypes };
			} catch (error) {
				console.warn("Failed to load ship types from API, using fallback data:", error);

				// Fallback data to ensure tests pass even without network
				return {
					shipTypes: {
						corvette: { type: "Starship" },
						exosuit: { type: "Exosuit" },
						standard: { type: "Starship" },
					},
				};
			}
		},
	],
	parameters: {
		docs: {
			description: {
				component:
					"Dropdown component for selecting ship types (Standard, Hauler, Corvette, etc). Manages platform selection and grid reset on change.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/ShipSelection",
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
