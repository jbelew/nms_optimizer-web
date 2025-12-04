import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";

import { usePlatformStore } from "../../store/PlatformStore";
import RecommendedBuild from "./RecommendedBuild";

const mockTechTree = {
	recommended_builds: [
		{
			title: "Balanced Build",
			layout: [],
		},
		{
			title: "Performance Build",
			layout: [],
		},
	],
};

const meta = {
	component: RecommendedBuild,
	title: "Components/RecommendedBuild",
	parameters: {
		docs: {
			description: {
				component: "Component for displaying and applying recommended technology builds.",
			},
		},
		layout: "fullscreen",
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
	},
} satisfies Meta<typeof RecommendedBuild>;

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
		<div className="p-4">
			<Story />
		</div>
	</StorybookWrapper>
);

export const Desktop: Story = {
	args: {
		techTree: mockTechTree,
		isLarge: true,
	},
	decorators: [(Story) => withLocalProviders(Story)],
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Recommended build component on desktop with large screen layout.",
			},
		},
	},
};

export const Tablet: Story = {
	args: {
		techTree: mockTechTree,
		isLarge: false,
	},
	decorators: [(Story) => withLocalProviders(Story)],
	globals: {
		viewport: {
			value: "tablet",
			isRotated: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Recommended build component on a tablet device.",
			},
		},
	},
};

export const Mobile: Story = {
	args: {
		techTree: mockTechTree,
		isLarge: false,
	},
	decorators: [(Story) => withLocalProviders(Story)],
	globals: {
		viewport: {
			value: "mobile",
			isRotated: false,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Recommended build component on a mobile device.",
			},
		},
	},
};
