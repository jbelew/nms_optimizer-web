import type { Meta, StoryObj } from "@storybook/react-vite";

import { GridTable } from "./GridTable";

const meta = {
	component: GridTable,
} satisfies Meta<typeof GridTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		activateRow: () => {},
		deActivateRow: () => {},
		solving: true,
		progressPercent: 0,
		shared: true,
		updateUrlForShare: () => "",
		updateUrlForReset: () => "",
		gridContainerRef: { current: null },
	},
};
