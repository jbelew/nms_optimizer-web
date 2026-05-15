import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";

import { useGridStore } from "../../store/grid/gridStore";
import AppHeader from "./AppHeader";

const meta = {
	component: AppHeader,
	parameters: {
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
		docs: {
			description: {
				component:
					"Header component displaying the app title, version, and action buttons for changelog, user stats, language selection, and accessibility toggle.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/AppHeader",
} satisfies Meta<typeof AppHeader>;

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
			useGridStore.setState({ isSharedGrid: false });
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
		<Story />
	</StorybookWrapper>
);

export const Desktop: Story = {
	args: {
		onShowChangelog: () => console.log("Changelog clicked"),
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
				story: "Header component on desktop.",
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story: "Header component on a tablet device.",
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story: "Header component on a mobile device.",
			},
		},
	},
};
