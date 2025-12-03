import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { MobileToolbar } from "./MobileToolbar";

// Decorator for setting Radix UI theme
const withRadixTheme = (theme: "light" | "dark") => (Story: React.FC) => {
	if (theme === "dark") {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}

	return <Story />;
};

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

export const DefaultLight: Story = {
	args: {
		isVisible: true,
		solving: false,
		hasModulesInGrid: true,
		onLoadBuild: () => console.log("Load Build"),
		onSaveBuild: () => console.log("Save Build"),
		onShowChangelog: () => console.log("Show Changelog"),
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Mobile Toolbar in light mode.",
			},
		},
	},
};

export const DefaultDark: Story = {
	args: {
		isVisible: true,
		solving: false,
		hasModulesInGrid: true,
		onLoadBuild: () => console.log("Load Build"),
		onSaveBuild: () => console.log("Save Build"),
		onShowChangelog: () => console.log("Show Changelog"),
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Mobile Toolbar in dark mode.",
			},
		},
	},
};
