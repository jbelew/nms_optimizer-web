import type { Meta, StoryObj } from "@storybook/react-vite";

import { useGridStore } from "../../store/GridStore";
import AppHeader from "./AppHeader";

// Decorator for setting Radix UI theme
const withRadixTheme = (theme: "light" | "dark") => (Story: React.FC) => {
	if (theme === "dark") {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}

	return <Story />;
};

const meta = {
	component: AppHeader,
	title: "Components/AppHeader",
	parameters: {
		docs: {
			description: {
				component:
					"Header component displaying the app title, version, and action buttons for changelog, user stats, language selection, and accessibility toggle.",
			},
		},
	},
	decorators: [
		(Story) => {
			useGridStore.setState({ isSharedGrid: false });

			return (
				<div className="flex w-full items-center justify-center">
					<div className="w-full">
						<Story />
					</div>
				</div>
			);
		},
	],
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DesktopLight: Story = {
	args: {
		onShowChangelog: () => console.log("Changelog clicked"),
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Standard header with all UI controls and buttons visible.",
			},
		},
	},
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const DesktopDark: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Standard header with all UI controls and buttons visible.",
			},
		},
	},
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const TabletLight: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Standard header with all UI controls and buttons visible.",
			},
		},
	},
	globals: {
		viewport: {
			value: "tablet",
			isRotated: false,
		},
	},
};

export const TabletDark: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Standard header with all UI controls and buttons visible.",
			},
		},
	},
	globals: {
		viewport: {
			value: "tablet",
			isRotated: false,
		},
	},
};

export const MobileLight: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Standard header with all UI controls and buttons visible.",
			},
		},
	},
	globals: {
		viewport: {
			value: "mobile",
			isRotated: false,
		},
	},
};

export const MobileDark: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Standard header with all UI controls and buttons visible.",
			},
		},
	},
	globals: {
		viewport: {
			value: "mobile",
			isRotated: false,
		},
	},
};
