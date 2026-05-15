import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { type TechTree, type TechTreeItem } from "../../hooks/useTechTree/useTechTree";
import { usePlatformStore } from "../../store/app/platformStore";
import { useGridStore } from "../../store/grid/gridStore";
import RecommendedBuild from "./RecommendedBuild";

// Simplified to a single build to match Exosuit behavior.
// We include the tech/module definition so modulesMap can resolve properties.
const mockTechTree: TechTree = {
	exosuit: [
		{
			color: "blue",
			key: "exosuit_tech",
			label: "Exosuit Tech",
			module_count: 1,
			modules: [
				{
					bonus: 10,
					id: "ET",
					label: "Exosuit Tech",
					sc_eligible: true,
					type: "tech",
					value: 100,
				},
			],
			type: "technology",
		},
	] as TechTreeItem[],
	recommended_builds: [
		{
			layout: [
				[
					{
						module: "ET",
						tech: "exosuit_tech",
					},
				],
			],
			title: "Exosuit Standard Build",
		},
	],
};

const meta = {
	component: RecommendedBuild,
	parameters: {
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
		docs: {
			description: {
				component: "Component for displaying and applying recommended technology builds.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/RecommendedBuild",
} satisfies Meta<typeof RecommendedBuild>;

export default meta;

type Story = StoryObj<typeof meta>;

// Wrapper component to reset store state before each story
/**
 *
 * @example
 */
const StorybookWrapper = ({
	children,
	resetStores = true,
}: {
	children: React.ReactNode;
	resetStores?: boolean;
}) => {
	useEffect(() => {
		if (resetStores) {
			usePlatformStore.setState({ selectedPlatform: "exosuit" });
			useGridStore.getState().resetGrid();
		}
	}, [resetStores]);

	return <>{children}</>;
};

// Decorator that wraps stories with necessary providers
/**
 *
 * @example
 */
const withLocalProviders = (Story: React.FC) => (
	<StorybookWrapper>
		<div className="p-4">
			<Story />
		</div>
	</StorybookWrapper>
);

export const Desktop: Story = {
	args: {
		isLarge: true,
		techTree: mockTechTree,
	},
	decorators: [(Story) => withLocalProviders(Story)],
	globals: {
		viewport: {
			isRotated: false,
			value: "desktop",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Recommended build component on desktop showing a single 'Apply' button.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// 1. Initial State Check: Should show the direct apply button
		// The text comes from t("techTree.recommendedBuilds.applyBuildButton") -> "Apply Recommended Build"
		const applyButton = await canvas.findByRole("button", { name: /Apply Recommended Build/i });
		expect(applyButton).toBeInTheDocument();

		// 2. Click the direct apply button
		await userEvent.click(applyButton);

		// 3. Verify that the grid state is updated
		// handleApply uses setTimeout(..., 0), so we must waitFor
		await waitFor(
			() => {
				const gridState = useGridStore.getState();
				// The module should be placed in [0, 0] as defined in the layout
				expect(gridState.grid.cells[0][0].module).toBe("ET");
			},
			{ timeout: 2000 }
		);
	},
};

export const Tablet: Story = {
	args: {
		isLarge: false,
		techTree: mockTechTree,
	},
	decorators: [(Story) => withLocalProviders(Story)],
	globals: {
		viewport: {
			isRotated: false,
			value: "tablet",
		},
	},
};

export const Mobile: Story = {
	args: {
		isLarge: false,
		techTree: mockTechTree,
	},
	decorators: [(Story) => withLocalProviders(Story)],
	globals: {
		viewport: {
			isRotated: false,
			value: "mobile",
		},
	},
};
