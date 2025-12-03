import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import * as Toast from "@radix-ui/react-toast";

import { NmsToast } from "./Toast";

const meta = {
	component: NmsToast,
	title: "Components/Toast/NmsToast",
	parameters: {
		docs: {
			description: {
				component: "A customizable toast notification component.",
			},
		},
	},
	decorators: [
		(Story) => {
			return (
				<Toast.Provider swipeDirection="right">
					<div
						className="flex min-h-screen items-center justify-center p-4"
						style={{ maxWidth: "800px", margin: "0 auto" }}
					>
						<Story />
					</div>
					<Toast.Viewport className="ToastViewport" />
				</Toast.Provider>
			);
		},
	],
} satisfies Meta<typeof NmsToast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: "Default Toast",
		description: "This is a basic toast notification to inform the user about a general event.",
		open: true,
		onOpenChange: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: "A default toast notification.",
			},
		},
	},
};

export const Success: Story = {
	args: {
		title: "Success!",
		description: "Your changes have been saved successfully. Good job!",
		variant: "success",
		open: true,
		onOpenChange: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: "A success toast notification.",
			},
		},
	},
};

export const Error: Story = {
	args: {
		title: "Error!",
		description: (
			<span>
				Failed to load data. Please <a href="#">try again</a> or contact support.
			</span>
		),
		variant: "error",
		open: true,
		onOpenChange: () => {},
	},
	parameters: {
		docs: {
			description: {
				story: "An error toast notification.",
			},
		},
	},
};
