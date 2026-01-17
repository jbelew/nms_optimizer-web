import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect } from "react";

import { usePlatformStore } from "../../store/PlatformStore";
import TechTree from "./TechTree";

const meta = {
	component: TechTree,
	title: "Components/TechTree",
	parameters: {
		docs: {
			description: {
				component:
					"Technology tree component for selecting and optimizing ship technology modules.",
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
} satisfies Meta<typeof TechTree>;

export default meta;

type Story = StoryObj<typeof meta>;

// Wrapper component to reset store state before each story
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
		techTree: {},
		handleOptimize: async (tech: string) => {
			console.log(`Optimizing ${tech}`);
		},
		solving: false,
	},
	decorators: [(Story) => withLocalProviders(Story)],
	render: (args, { loaded }) => <TechTree {...args} {...loaded} />,
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Tech tree component on desktop.",
			},
		},
	},
	loaders: meta.loaders,
};

export const Tablet: Story = {
	args: {
		...Desktop.args,
	},
	decorators: [(Story) => withLocalProviders(Story)],
	render: Desktop.render,
	globals: {
		viewport: {
			value: "tablet",
			isRotated: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Tech tree component on a tablet device.",
			},
		},
	},
	loaders: meta.loaders,
};

export const Mobile: Story = {
	args: {
		...Desktop.args,
	},
	decorators: [(Story) => withLocalProviders(Story)],
	render: Desktop.render,
	globals: {
		viewport: {
			value: "mobile",
			isRotated: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Tech tree component on a mobile device.",
			},
		},
	},
	loaders: meta.loaders,
};
