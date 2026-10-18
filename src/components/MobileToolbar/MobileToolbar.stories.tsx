import type { Meta, StoryObj } from "@storybook/react-vite";

import { useGridStore } from "@/store/grid/gridStore";

import { MobileToolbar } from "./MobileToolbar";

const meta = {
	component: MobileToolbar,
	decorators: [
		(Story) => {
			useGridStore.setState({
				hasModulesInGrid: true,
				isSharedGrid: false,
			});

			return (
				<div className="min-h-screen w-full pt-14">
					<Story />
				</div>
			);
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
				component: "Mobile toolbar for grid operations and utility actions.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/MobileToolbar",
} satisfies Meta<typeof MobileToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: "Mobile Toolbar with controls for grid operations.",
			},
		},
	},
};
