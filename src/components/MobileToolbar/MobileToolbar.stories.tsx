import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { createRef } from "react";

import { MobileToolbar } from "./MobileToolbar";

const meta = {
	component: MobileToolbar,
	decorators: [
		(Story) => {
			return (
				<div
					className="flex min-h-screen items-center justify-center p-4"
					style={{ margin: "0 auto", maxWidth: "800px" }}
				>
					<Story />
				</div>
			);
		},
	],
	parameters: {
		docs: {
			description: {
				component: "Mobile toolbar for grid operations and utility actions.",
			},
		},
	},
	title: "Components/MobileToolbar",
} satisfies Meta<typeof MobileToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		gridRef: createRef<HTMLDivElement>(),
		hasModulesInGrid: true,
		isVisible: true,
		onLoadBuild: () => console.log("Load Build"),
		onSaveBuild: () => console.log("Save Build"),
		onShowChangelog: () => console.log("Show Changelog"),
		solving: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Mobile Toolbar with controls for grid operations.",
			},
		},
		layout: "fullscreen",
	},
};
