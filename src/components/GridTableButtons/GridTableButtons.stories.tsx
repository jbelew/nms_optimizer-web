import type { Meta, StoryObj } from "@storybook/react-vite";

import { useGridStore } from "@/store/grid/gridStore";

import GridTableButtons from "./GridTableButtons";

const meta: Meta<typeof GridTableButtons> = {
	component: GridTableButtons,
	decorators: [
		(Story) => (
			<div
				className="main-app__grid-section flex min-h-screen items-center justify-center p-4"
				style={{ margin: "0 auto", maxWidth: "800px" }}
			>
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Control buttons for grid operations including load/save builds, share grid, reset, and help/about dialogs.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/GridTableButtons",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		solving: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Grid buttons in default empty-grid state.",
			},
		},
	},
};

export const WithModulesInGrid: Story = {
	args: {
		solving: false,
	},
	decorators: [
		(Story) => {
			useGridStore.setState({
				hasModulesInGrid: true,
				isDefaultGrid: false,
				isSharedGrid: false,
			});

			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: "Grid buttons when the grid is populated with modules (Save, Share, Screenshot, and Reset Build enabled).",
			},
		},
	},
};
