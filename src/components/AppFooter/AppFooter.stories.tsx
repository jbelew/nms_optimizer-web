import type { Meta, StoryObj } from "@storybook/react-vite";

import AppFooter from "./AppFooter";

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
	component: AppFooter,
	title: "Components/AppFooter",
	decorators: [
		(Story) => (
			<div className="flex items-center justify-center">
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Footer component displaying build version, build date, social links, and support options.",
			},
		},
	},
} satisfies Meta<typeof AppFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DesktopLight: Story = {
	args: {
		buildVersion: "6.1.2",
		buildDate: "2024-11-25T15:30:00Z",
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Footer with version and build date displayed.",
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
	render: DesktopLight.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad) in Light Mode.",
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

export const TabletDark: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	render: DesktopLight.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad) in Light Mode.",
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

export const TabletLight: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	render: DesktopLight.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad) in Light Mode.",
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

export const MobileDark: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	render: DesktopLight.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad) in Light Mode.",
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

export const MobileLight: Story = {
	args: {
		...DesktopLight.args,
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	render: DesktopLight.render,
	parameters: {
		docs: {
			description: {
				story: "Main application view on a tablet device (iPad) in Light Mode.",
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
