import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Box } from "@radix-ui/themes";

import ErrorBoundaryInset from "./ErrorBoundaryInset";

const meta = {
	component: ErrorBoundaryInset,
	title: "components/ErrorBoundary/ErrorBoundaryInset",
	decorators: [
		(Story) => (
			<Box
				className="flex h-screen items-center justify-center p-8"
				style={{ backgroundColor: "var(--accent-3)" }}
			>
				<Story />
			</Box>
		),
	],
} satisfies Meta<typeof ErrorBoundaryInset>;

export default meta;

type Story = StoryObj<typeof meta>;

const ThrowError = () => {
	throw new Error("This is an error inside the ErrorBoundaryInset.");
};

export const Default: Story = {
	args: {
		children: <ThrowError />,
	},
	parameters: {
		docs: {
			description: {
				story: "Error boundary inset showing an error state.",
			},
		},
	},
};
