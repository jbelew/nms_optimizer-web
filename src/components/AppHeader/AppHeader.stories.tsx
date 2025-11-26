import type { Meta, StoryObj } from "@storybook/react-vite";

import { useGridStore } from "../../store/GridStore";
import AppHeader from "./AppHeader";

const meta = {
	component: AppHeader,
	title: "Components/AppHeader",
	parameters: {
		docs: {
			description: {
				component:
					"Header component displaying the app title, version, and action buttons for changelog, user stats, language selection, and accessibility toggle.",
			},
		},
	},
	decorators: [
		(Story) => {
			// Initialize grid store for isSharedGrid check
			useGridStore.setState({ isSharedGrid: false });
			return <Story />;
		},
	],
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onShowChangelog: () => console.log("Changelog clicked"),
	},
	parameters: {
		docs: {
			description: {
				story: "Standard header with all UI controls and buttons visible.",
			},
		},
	},
};
