import type { Meta, StoryObj } from "@storybook/react-vite";

import OfflineBanner from "./OfflineBanner";

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
	component: OfflineBanner,
	title: "components/OfflineBanner",
	decorators: [
		(Story) => {
			// Mock navigator.onLine to return false for the story
			Object.defineProperty(navigator, "onLine", {
				writable: true,
				value: false,
			});

			return <Story />;
		},
	],
} satisfies Meta<typeof OfflineBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OfflineLight: Story = {
	decorators: [(Story) => withRadixTheme("light")(Story)],
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const OfflineDark: Story = {
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};
