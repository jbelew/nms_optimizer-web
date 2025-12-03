import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Toast from "@radix-ui/react-toast";

import { ToastProvider } from "../../hooks/useToast/useToast";
import { ShipSelection } from "./ShipSelection";

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
	component: ShipSelection,
	title: "Components/ShipSelection",
	parameters: {
		docs: {
			description: {
				component:
					"Dropdown component for selecting ship types (Standard, Hauler, Corvette, etc). Manages platform selection and grid reset on change.",
			},
		},
	},
	decorators: [
		(Story) => (
			<Toast.Provider swipeDirection="right">
				<ToastProvider>
					<div className="flex h-screen w-screen items-center justify-center p-4">
						<div className="max-h-full max-w-full overflow-auto">
							<Story />
						</div>
					</div>
				</ToastProvider>
				<Toast.Viewport className="ToastViewport" />
			</Toast.Provider>
		),
	],
	loaders: [
		async () => {
			try {
				const response = await fetch(
					"https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/platforms"
				);

				if (!response.ok) {
					throw new Error(`API responded with status ${response.status}`);
				}

				const shipTypes = await response.json();

				return { shipTypes };
			} catch (error) {
				console.error("Failed to load ship types for Storybook:", error);

				return { shipTypes: {} };
			}
		},
	],
} satisfies Meta<typeof ShipSelection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultLight: Story = {
	args: {
		solving: false,
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Ship selection dropdown ready for user interaction.",
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

export const DefaultDark: Story = {
	args: {
		solving: false,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Ship selection dropdown ready for user interaction.",
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
