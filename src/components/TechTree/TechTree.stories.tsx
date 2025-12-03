import type { Meta, StoryObj } from "@storybook/react-vite";
import { create } from "zustand";

import { PlatformState, usePlatformStore } from "../../store/PlatformStore";
import TechTree from "./TechTree";

// Mock Zustand store
const mockPlatformStore = create<PlatformState>(() => ({
	platforms: ["standard", "hauler"],
	selectedPlatform: "standard",
	setPlatforms: () => {},
	setSelectedPlatform: () => {},
	initializePlatform: () => {},
}));

const meta = {
	component: TechTree,
	decorators: [
		(Story) => {
			usePlatformStore.setState(mockPlatformStore.getState(), true);

			return (
				<div className="flex h-screen w-screen items-center justify-center p-4">
					<div className="max-h-full max-w-full overflow-auto">
						<Story />
					</div>
				</div>
			);
		},
	],
	loaders: [
		async () => {
			try {
				const response = await fetch(
					"https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/tech_tree/standard"
				);

				if (!response.ok) {
					throw new Error(`API responded with status ${response.status}`);
				}

				const techTree = await response.json();

				return { techTree };
			} catch (error) {
				console.error("Failed to load tech tree for Storybook:", error);

				return { techTree: {} };
			}
		},
	],
} satisfies Meta<typeof TechTree>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		handleOptimize: async (tech: string) => {
			console.log(`Optimizing ${tech}`);
		},

		solving: false,
		gridTableTotalWidth: 400,
		techTree: {},
	},
	render: (args, { loaded }) => <TechTree {...args} {...loaded} />,
};
