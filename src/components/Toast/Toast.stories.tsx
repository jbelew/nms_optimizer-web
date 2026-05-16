import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import * as Toast from "@radix-ui/react-toast";

import { NmsToast } from "./Toast";

const meta = {
	component: NmsToast,
	decorators: [
		(Story) => {
			return (
				<Toast.Provider swipeDirection="right">
					<div
						className="flex min-h-screen items-center justify-center p-4"
						style={{ margin: "0 auto", maxWidth: "800px" }}
					>
						<Story />
					</div>
					<Toast.Viewport className="ToastViewport" />
				</Toast.Provider>
			);
		},
	],
	parameters: {
		docs: {
			description: {
				component: "A customizable toast notification component.",
			},
		},
	},
	title: "Components/Toast/NmsToast",
} satisfies Meta<typeof NmsToast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		description: "This is a basic toast notification to inform the user about a general event.",
		onOpenChange: () => {},
		open: true,
		title: "Default Toast",
	},
	parameters: {
		docs: {
			description: {
				story: "A default toast notification.",
			},
		},
		layout: "fullscreen",
	},
};

export const Success: Story = {
	args: {
		description: "Your changes have been saved successfully. Good job!",
		onOpenChange: () => {},
		open: true,
		title: "Success!",
		variant: "success",
	},
	parameters: {
		docs: {
			description: {
				story: "A success toast notification.",
			},
		},
		layout: "fullscreen",
	},
};

export const Error: Story = {
	args: {
		description: (
			<span>
				Failed to load data. Please{" "}
				<button className="cursor-pointer underline" type="button">
					try again
				</button>{" "}
				or contact support.
			</span>
		),
		onOpenChange: () => {},
		open: true,
		title: "Error!",
		variant: "error",
	},
	parameters: {
		docs: {
			description: {
				story: "An error toast notification.",
			},
		},
		layout: "fullscreen",
	},
};
