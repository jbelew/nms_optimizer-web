import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { ErrorContent } from "./ErrorBoundary";

const meta = {
	argTypes: {
		variant: {
			control: "radio",
			options: ["page", "inset"],
		},
	},
	component: ErrorContent,
	parameters: {
		layout: "fullscreen",
	},
	title: "Components/ErrorBoundary/ErrorContent",
} satisfies Meta<typeof ErrorContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PageVariant: Story = {
	args: {
		variant: "page",
	},
	parameters: {
		docs: {
			description: {
				story: "Error content with page variant.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByRole("heading", { level: 2 })).toBeInTheDocument();
		await expect(canvas.getByRole("link")).toHaveAttribute(
			"href",
			"https://github.com/jbelew/nms_optimizer-web/issues",
		);
	},
};

export const WithErrorMessage: Story = {
	args: {
		error: {
			message: "This is a sample error message.",
			name: "Error",
		},
		variant: "page",
	},
	parameters: {
		docs: {
			description: {
				story: "Error content with error message.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText(/This is a sample error message\./i),
		).toBeInTheDocument();
	},
};

export const WithStackTrace: Story = {
	args: {
		error: {
			message: "Something went wrong",
			name: "Error",
			stack: `Error: Something went wrong
    at ErrorPage (http://localhost:5173/src/components/ErrorBoundary/ErrorPage.tsx:10:1)
    at renderWithHooks (http://localhost:5173/node_modules/react/index.js:200:45)
    at mountIndeterminateComponent (http://localhost:5173/node_modules/react/index.js:500:30)`,
		},
		variant: "page",
	},
	parameters: {
		docs: {
			description: {
				story: "Error content with stack trace.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect((await canvas.findAllByText(/Something went wrong/i)).length).toBeGreaterThan(
			0,
		);
		await expect(canvas.getByText(/mountIndeterminateComponent/i)).toBeInTheDocument();
	},
};

export const WithComponentStack: Story = {
	args: {
		error: {
			message: "Error with component stack",
			name: "Error",
		},
		errorInfo: {
			componentStack: `
    in ErrorPage
    in Story
    in ThemeProvider`,
		},
		variant: "page",
	},
	parameters: {
		docs: {
			description: {
				story: "Error content with component stack.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText(/Error with component stack/i)).toBeInTheDocument();
		await expect(canvas.getByText(/in ThemeProvider/i)).toBeInTheDocument();
	},
};
