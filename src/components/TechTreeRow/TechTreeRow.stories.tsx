import type { Meta, StoryObj } from "@storybook/react-vite";

import { TechTreeRow } from "./TechTreeRow";

const meta = {
	component: TechTreeRow,
} satisfies Meta<typeof TechTreeRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		tech: "tech",
		handleOptimize: async (tech: string) => {
			console.log(`Optimizing ${tech}`);
		},
		solving: true,
		techImage: "hyperdrive.webp",
		isGridFull: true,
		techColor: "gray",
	},
};
