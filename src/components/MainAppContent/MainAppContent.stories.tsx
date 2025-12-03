import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
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
					<Story />
				</StorybookWrapper>
			</ToastProvider>
			<Toast.Viewport className="ToastViewport" />
		</Toast.Provider>
	);

// Decorator for setting Radix UI theme
const withRadixTheme = (theme: "light" | "dark") => (Story: React.FC) => {
	if (theme === "dark") {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}

	return <Story />;
};

export const DesktopLight: Story = {
	args: {
		buildVersion: "1.0.0",
		buildDate: "2024-11-25",
	},
	decorators: [
		(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story),
		withRadixTheme("light"),
	],
	render: (args) => <MainAppContent {...args} />,
	parameters: {
		docs: {
			description: {
				story: "Main application view with empty grid and tech tree in Light Mode. Standard layout for desktop users.",
			},
		},
		viewport: {
			defaultViewport: "desktop",
		},
	},
	loaders: meta.loaders,
};

export const DesktopDark: Story = {
	args: {
		buildVersion: "1.0.0",
		buildDate: "2024-11-25",
	},
	decorators: [
		(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story),
		withRadixTheme("dark"),
	],
	render: (args) => <MainAppContent {...args} />,
	parameters: {
		docs: {
			description: {
				story: "Main application view with empty grid and tech tree in Dark Mode. Standard layout for desktop users.",
			},
		},
		viewport: {
			defaultViewport: "desktop",
		},
	},
	loaders: meta.loaders,
};

export const TabletLight: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [
		(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story),
		withRadixTheme("light"),
	],
	render: DesktopLight.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad) in Light Mode.",
			},
		},
		viewport: {
			defaultViewport: "ipad",
		},
	},
	loaders: meta.loaders,
};

export const TabletDark: Story = {
	args: {
		...DesktopDark.args,
	},
	decorators: [
		(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story),
		withRadixTheme("dark"),
	],
	render: DesktopDark.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad) in Dark Mode.",
			},
		},
		viewport: {
			defaultViewport: "ipad",
		},
	},
	loaders: meta.loaders,
};

export const MobileLight: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [
		(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story),
		withRadixTheme("light"),
	],
	render: DesktopLight.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a mobile device in Light Mode.",
			},
		},
		viewport: {
			defaultViewport: "mobile1",
		},
	},
	loaders: meta.loaders,
};

export const MobileDark: Story = {
	args: {
		...DesktopDark.args,
	},
	decorators: [
		(Story, context) => withLocalProviders(false, context.loaded.techTree)(Story),
		withRadixTheme("dark"),
	],
	render: DesktopDark.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a mobile device in Dark Mode.",
			},
		},
		viewport: {
			defaultViewport: "mobile1",
		},
	},
	loaders: meta.loaders,
};
