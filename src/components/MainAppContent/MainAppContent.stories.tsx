import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";

import { type TechTree, type TechTreeItem } from "../../hooks/useTechTree/useTechTree";
import { ToastProvider } from "../../hooks/useToast/useToast";
import { createGrid, useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechStore } from "../../store/TechStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { MainAppContent } from "./MainAppContent";

const meta = {
	component: MainAppContent,
	title: "Components/MainAppContent",
	parameters: {
		docs: {
			description: {
				component:
					"The core component that orchestrates the main application layout, including header, grid table, tech tree, and dialogs.",
			},
		},
		layout: "fullscreen",
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
	},
	loaders: [
		async () => {
			try {
				const response = await fetch(
					"https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/tech_tree/standard"
				);

				if (!response.ok) {
					throw new Error(`API responded with status ${response.status}`);
				}

				const techTree = await response.json();

				return { techTree };
			} catch (error) {
				console.error("Failed to load tech tree for Storybook:", error);

				return { techTree: {} };
			}
		},
	],
} satisfies Meta<typeof MainAppContent>;

export default meta;

type Story = StoryObj<typeof meta>;

// Wrapper component to reset store state before each story
const StorybookWrapper = ({
	children,
	resetStores = true,
	isSharedGrid = false,
	techTree,
}: {
	children: React.ReactNode;
	resetStores?: boolean;
	isSharedGrid?: boolean;
	techTree?: TechTree;
}) => {
	useEffect(() => {
		if (resetStores) {
			// Reset GridStore with proper grid structure (10 width, 6 height)
			useGridStore.setState({
				isSharedGrid,
				grid: createGrid(10, 6),
				result: null,
				gridFixed: false,
				superchargedFixed: false,
			});

			// Reset PlatformStore
			usePlatformStore.setState({ selectedPlatform: "standard" });

			// Reset TechTreeLoadingStore
			useTechTreeLoadingStore.setState({ isLoading: false });

			// Initialize TechStore with tech tree data
			if (techTree) {
				const techColors: { [key: string]: string } = {};
				const techGroups: { [key: string]: TechTreeItem[] } = {};

				// Extract colors and groups from tech tree
				Object.entries(techTree).forEach(([key, value]) => {
					if (Array.isArray(value) && value.length > 0 && "color" in value[0]) {
						const item = value[0] as TechTreeItem;
						techColors[key] = item.color;
						techGroups[key] = value as TechTreeItem[];
					}
				});

				useTechStore.setState({
					techColors,
					techGroups,
					max_bonus: {},
					solved_bonus: {},
					solve_method: {},
					checkedModules: {},
					activeGroups: {},
				});
			}
		}
	}, [resetStores, isSharedGrid, techTree]);

	return <>{children}</>;
};

// Decorator that wraps stories with necessary providers including dialog
const withLocalProviders =
	(isSharedGrid: boolean = false, techTree?: TechTree) =>
	(Story: React.FC) => (
		<Toast.Provider swipeDirection="right">
			<ToastProvider>
				<StorybookWrapper isSharedGrid={isSharedGrid} techTree={techTree}>
					<React.Suspense fallback={<div>Loading story...</div>}>
						<Story />
					</React.Suspense>
				</StorybookWrapper>
			</ToastProvider>
			<Toast.Viewport className="ToastViewport" />
		</Toast.Provider>
	);

export const Desktop: Story = {
	args: {
		buildVersion: "1.0.0",
		buildDate: "2024-11-25",
	},
	decorators: [(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story)],
	render: (args) => <MainAppContent {...args} />,
	parameters: {
		docs: {
			description: {
				story: "Main application view with empty grid and tech tree. Standard layout for desktop users.",
			},
		},
	},
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
	loaders: meta.loaders,
};

export const Tablet: Story = {
	args: {
		...Desktop.args,
	},
	decorators: [(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story)],
	render: Desktop.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad).",
			},
		},
	},
	globals: {
		viewport: {
			value: "tablet",
			isRotated: false,
		},
	},
	loaders: meta.loaders,
};

export const Mobile: Story = {
	args: {
		...Desktop.args,
	},
	decorators: [
		(Story, context) => {
			// Mock touch device for mobile story to show TapInstructions
			Object.defineProperty(navigator, "maxTouchPoints", {
				value: 1,
				writable: true,
				configurable: true,
			});

			return withLocalProviders(false, context.loaded.techTree)(Story);
		},
	],
	render: Desktop.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a mobile device.",
			},
		},
	},
	globals: {
		viewport: {
			value: "mobile",
			isRotated: false,
		},
	},
	loaders: meta.loaders,
};
