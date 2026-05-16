import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect } from "react";

import { usePlatformStore } from "@/store/app/platformStore";

import TechTree from "./TechTree";

const meta = {
	component: TechTree,
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
					"Technology tree component for selecting and optimizing ship technology modules.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/TechTree",
} satisfies Meta<typeof TechTree>;

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
			usePlatformStore.setState({ selectedPlatform: "standard" });
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
		<div className="p-5">
			<React.Suspense fallback={<div>Loading story...</div>}>
				<Story />
			</React.Suspense>
		</div>
	</StorybookWrapper>
);

export const Desktop: Story = {
	args: {
		gridTableTotalWidth: 400,
		handleOptimize: async (tech: string) => {
			console.log(`Optimizing ${tech}`);
		},
		solving: false,
		techTree: {},
	},
	decorators: [(Story) => withLocalProviders(Story)],
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
				story: "Tech tree component on desktop.",
			},
		},
	},
	render: (args, { loaded }) => <TechTree {...args} {...loaded} />,
};

export const Tablet: Story = {
	args: {
		...Desktop.args,
	},
	decorators: [(Story) => withLocalProviders(Story)],
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
				story: "Tech tree component on a tablet device.",
			},
		},
	},
	render: Desktop.render,
};

export const Mobile: Story = {
	args: {
		...Desktop.args,
	},
	decorators: [(Story) => withLocalProviders(Story)],
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
				story: "Tech tree component on a mobile device.",
			},
		},
	},
	render: Desktop.render,
};
