import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { useGridStore } from "@/store/grid/gridStore";

import { MainAppContent } from "./MainAppContent";

const meta = {
	component: MainAppContent,
	decorators: [
		(Story) => (
			<React.Suspense fallback={<div>Loading story...</div>}>
				<Story />
			</React.Suspense>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Primary workspace layout module orchestrating the header, Platform Type selector, Inventory Grid, Technology Tree sidebar, and footers.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/MainAppContent",
} satisfies Meta<typeof MainAppContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
	globals: {
		viewport: {
			isRotated: false,
			value: "desktop",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Main application workspace on a desktop viewport.",
			},
		},
	},
};

export const Tablet: Story = {
	globals: {
		viewport: {
			isRotated: false,
			value: "tablet",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Main application workspace on a tablet viewport.",
			},
		},
	},
};

export const Mobile: Story = {
	decorators: [
		(Story) => {
			Object.defineProperty(navigator, "maxTouchPoints", {
				configurable: true,
				value: 1,
				writable: true,
			});

			return <Story />;
		},
	],
	globals: {
		viewport: {
			isRotated: false,
			value: "mobile",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Main application workspace on a mobile viewport.",
			},
		},
	},
};

export const SharedGrid: Story = {
	decorators: [
		(Story) => {
			useGridStore.setState({ isSharedGrid: true });

			return <Story />;
		},
	],
	globals: {
		viewport: {
			isRotated: false,
			value: "desktop",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Main application workspace in read-only Shared Grid mode (sidebar hidden and toast notification displayed).",
			},
		},
	},
};
