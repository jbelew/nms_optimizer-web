import type { Meta, StoryObj } from "@storybook/react-vite";

import UpdatePrompt from "./UpdatePrompt";

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
	component: UpdatePrompt,
	title: "components/UpdatePrompt",
} satisfies Meta<typeof UpdatePrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultLight: Story = {
	args: {
		isOpen: true,
		onRefresh: () => console.log("Refresh clicked"),
		onDismiss: () => console.log("Dismiss clicked"),
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};

export const DefaultDark: Story = {
	args: {
		isOpen: true,
		onRefresh: () => console.log("Refresh clicked"),
		onDismiss: () => console.log("Dismiss clicked"),
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	globals: {
		viewport: {
			value: "desktop",
			isRotated: false,
		},
	},
};
