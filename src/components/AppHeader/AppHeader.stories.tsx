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
			useGridStore.setState({ isSharedGrid: false });

			return (
				<div className="flex w-full items-center justify-center">
					<div className="w-full">
						<Story />
					</div>
				</div>
			);
		},
	],
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
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
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const Tablet: Story = {
	args: {
		...Desktop.args,
	},
	parameters: {
		docs: {
			description: {
				story: "Standard header with all UI controls and buttons visible.",
			},
		},
	},
	globals: {
		viewport: {
			value: "tablet",
			isRotated: false,
		},
	},
};

export const Mobile: Story = {
	args: {
		...Desktop.args,
	},
	parameters: {
		docs: {
			description: {
				story: "Standard header with all UI controls and buttons visible.",
			},
		},
	},
	globals: {
		viewport: {
			value: "mobile",
			isRotated: false,
		},
	},
};
