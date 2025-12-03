import type { Meta, StoryObj } from "@storybook/react-vite";

import { useGridStore } from "../../store/GridStore";
import { withDialogProvider } from "../../stories/decorators";
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
			useGridStore.setState({ isSharedGrid: false });

			return (
				<div className="flex h-screen w-screen items-center justify-center p-6">
					<div className="w-full">
						<Story />
					</div>
				</div>
			);
		},
		withDialogProvider,
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
