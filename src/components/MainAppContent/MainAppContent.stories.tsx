import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect } from "react";
import { Provider as ToastProviderRadix, Viewport as ToastViewport } from "@radix-ui/react-toast";

import { type TechTree, type TechTreeItem } from "@/hooks/useTechTree/useTechTree";
import { ToastProvider } from "@/hooks/useToast/useToast";
import { usePlatformStore } from "@/store/app/platformStore";
import { createGrid, useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useUiStore } from "@/store/ui/uiStore";

import { MainAppContent } from "./MainAppContent";

const meta = {
	component: MainAppContent,
	loaders: [
		async () => {
			try {
				const response = await fetch("https://api.nms-optimizer.app/tech_tree/standard");

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
	parameters: {
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
		docs: {
			description: {
				component:
					"The core component that orchestrates the main application layout, including header, grid table, tech tree, and dialogs.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/MainAppContent",
} satisfies Meta<typeof MainAppContent>;

export default meta;

type Story = StoryObj<typeof meta>;

// Wrapper component to reset store state before each story
/**
 *
 * @example
 */
const StorybookWrapper = ({
	children,
	isSharedGrid = false,
	resetStores = true,
	techTree,
}: {
	children: React.ReactNode;
	isSharedGrid?: boolean;
	resetStores?: boolean;
	techTree?: TechTree;
}) => {
	useEffect(() => {
		if (resetStores) {
			// Reset GridStore with proper grid structure (10 width, 6 height)
			useGridStore.setState({
				grid: createGrid(10, 6),
				gridFixed: false,
				isSharedGrid,
				result: null,
				superchargedFixed: false,
			});

			// Reset PlatformStore
			usePlatformStore.setState({ selectedPlatform: "standard" });

			// Reset TechTreeLoadingStore
			useUiStore.setState({ isTechTreeLoading: false });

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
					activeGroups: {},
					checkedModules: {},
					maxBonus: {},
					solvedBonus: {},
					solveMethod: {},
					techColors,
					techGroups,
				});
			}
		}
	}, [resetStores, isSharedGrid, techTree]);

	return <>{children}</>;
};

// Decorator that wraps stories with necessary providers including dialog
/**
 *
 * @example
 */
const withLocalProviders =
	(isSharedGrid: boolean = false, techTree?: TechTree) =>
	(Story: React.FC) => (
		<ToastProviderRadix swipeDirection="right">
			<ToastProvider>
				<StorybookWrapper isSharedGrid={isSharedGrid} techTree={techTree}>
					<React.Suspense fallback={<div>Loading story...</div>}>
						<Story />
					</React.Suspense>
				</StorybookWrapper>
			</ToastProvider>
			<ToastViewport className="ToastViewport" />
		</ToastProviderRadix>
	);

export const Desktop: Story = {
	decorators: [(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story)],
	globals: {
		viewport: {
			isRotated: false,
			value: "desktop",
		},
	},
	loaders: meta.loaders,
	parameters: {
		docs: {
			description: {
				story: "Main application view with empty grid and tech tree. Standard layout for desktop users.",
			},
		},
	},
	render: () => <MainAppContent />,
};

export const Tablet: Story = {
	decorators: [(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story)],
	globals: {
		viewport: {
			isRotated: false,
			value: "tablet",
		},
	},
	loaders: meta.loaders,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad).",
			},
		},
	},
	render: () => <MainAppContent />,
};

export const Mobile: Story = {
	decorators: [
		(Story, context) => {
			// Mock touch device for mobile story to show TapInstructions
			Object.defineProperty(navigator, "maxTouchPoints", {
				configurable: true,
				value: 1,
				writable: true,
			});

			return withLocalProviders(false, context.loaded.techTree)(Story);
		},
	],
	globals: {
		viewport: {
			isRotated: false,
			value: "mobile",
		},
	},
	loaders: meta.loaders,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a mobile device.",
			},
		},
	},
	render: () => <MainAppContent />,
};
