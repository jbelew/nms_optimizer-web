import "@/components/MainAppContent/MainAppContent.scss";

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flex } from "@radix-ui/themes";
import { expect, within } from "storybook/test";

import { usePlatformStore } from "@/store/app/platformStore";

import { TechTree, TechTreeSkeleton } from "./TechTree";

const meta = {
	component: TechTree,
	decorators: [
		(Story) => (
			<div className="flex min-h-screen items-start justify-center p-5">
				<Flex
					className="main-app__tech-tree-section"
					direction="column"
					minHeight="0"
					style={{ maxHeight: "760px" }}
				>
					<React.Suspense fallback={<TechTreeSkeleton height={680} />}>
						<Story />
					</React.Suspense>
				</Flex>
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Technology tree sidebar component for selecting and optimizing ship technology modules.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/TechTree",
} satisfies Meta<typeof TechTree>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
	globals: {
		viewport: {
			isRotated: false,
			value: "desktop",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Tech tree component on desktop.",
			},
		},
	},
};

export const Tablet: Story = {
	globals: {
		viewport: {
			isRotated: false,
			value: "tablet",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Tech tree component on a tablet device.",
			},
		},
	},
};

export const Mobile: Story = {
	globals: {
		viewport: {
			isRotated: false,
			value: "mobile",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Tech tree component on a mobile device.",
			},
		},
	},
};

export const WithRecommendedBuilds: Story = {
	decorators: [
		(Story) => {
			usePlatformStore.setState({ selectedPlatform: "colossus" });

			return <Story />;
		},
	],
	globals: {
		viewport: {
			isRotated: false,
			value: "desktop",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Tech tree component with the pinned Recommended Builds preset card displayed.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const heading = await canvas.findByRole("heading", {
			level: 2,
			name: /Recommended Builds/i,
		});
		await expect(heading).toBeInTheDocument();

		const applyButton = await canvas.findByRole("button", { name: /Apply Build/i });
		await expect(applyButton).toBeInTheDocument();
	},
};
