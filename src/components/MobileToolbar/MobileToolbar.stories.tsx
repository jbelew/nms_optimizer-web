import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { MobileToolbar } from "./MobileToolbar";

const meta = {
	component: MobileToolbar,
	title: "Components/MobileToolbar",
	parameters: {
		docs: {
			description: {
				component: "Mobile toolbar for grid operations and utility actions.",
			},
		},
	},
	decorators: [
		(Story) => {
			return (
				<div
					className="flex min-h-screen items-center justify-center p-4"
					style={{ maxWidth: "800px", margin: "0 auto" }}
				>
					<Story />
				</div>
			);
		},
	],
} satisfies Meta<typeof MobileToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isVisible: true,
		solving: false,
		hasModulesInGrid: true,
		onLoadBuild: () => console.log("Load Build"),
		onSaveBuild: () => console.log("Save Build"),
		onShowChangelog: () => console.log("Show Changelog"),
	},
	parameters: {
		docs: {
			description: {
				story: "Mobile Toolbar with controls for grid operations.",
			},
		},
	},
};
