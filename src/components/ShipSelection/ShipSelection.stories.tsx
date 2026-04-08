import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Toast from "@radix-ui/react-toast";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { ToastProvider } from "../../hooks/useToast/useToast";
import i18n from "../../i18n/i18n";
import { usePlatformStore } from "../../store/PlatformStore";
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
		shipSelection: {
			selectPlatform: "Select Platform",
		},
	},
	true,
	true
);

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
						standard: { type: "Starship" },
						corvette: { type: "Starship" },
						exosuit: { type: "Exosuit" },
					},
				};
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// 1. Initial State Check: Wait for button to transition from LoadingState (disabled) to Ready state
		const trigger = await canvas.findByRole("button", { name: /Select ship type/i });

		// The button starts disabled while fetching ship types (Suspense fallback)
		// We MUST wait for it to be enabled before clicking
		await waitFor(() => expect(trigger).not.toBeDisabled(), { timeout: 10000 });

		// 2. Open the dropdown
		await userEvent.click(trigger);

		// 3. Find and select "Corvettes" (regex for case-insensitive and partial match)
		// Radix UI items are in a portal
		try {
			const body = within(canvasElement.ownerDocument.body);

			// Wait for the dropdown content to be visible
			// We use findByText as a fallback if findByRole fails
			const corvetteOption = await body.findByRole("menuitemradio", { name: /Corvette/i });
			expect(corvetteOption).toBeInTheDocument();
			await userEvent.click(corvetteOption);
		} catch (error) {
			console.error(
				"Failed to find Corvette option. Body content:",
				canvasElement.ownerDocument.body.innerHTML
			);
			throw error;
		}

		// 4. Verify selection update in store
		await waitFor(
			() => {
				const state = usePlatformStore.getState();
				expect(state.selectedPlatform).toBe("corvette");
			},
			{ timeout: 2000 }
		);
	},
};
