import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorContent } from "./ErrorContent";

const meta = {
	component: ErrorContent,
	title: "components/ErrorBoundary/ErrorContent",
	parameters: {
		layout: "fullscreen",
	},
	argTypes: {
		variant: {
			control: "radio",
			options: ["page", "inset"],
		},
	},
} satisfies Meta<typeof ErrorContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PageVariant: Story = {
	args: {
		variant: "page",
	},
};

export const WithErrorMessage: Story = {
	args: {
		variant: "page",
		error: new Error("This is a sample error message."),
	},
};

export const WithStackTrace: Story = {
	args: {
		variant: "page",
		error: {
			name: "Error",
			message: "Something went wrong",
			stack: `Error: Something went wrong
    at ErrorPage (http://localhost:6006/src/components/ErrorBoundary/ErrorPage.tsx:10:1)
    at renderWithHooks (http://localhost:6006/node_modules/.cache/sb/.vite-storybook/deps/chunk-QA6L6B62.js?v=1234:1234:1)
    at mountIndeterminateComponent (http://localhost:6006/node_modules/.cache/sb/.vite-storybook/deps/chunk-QA6L6B62.js?v=1234:1234:1)`,
		},
	},
};

export const WithComponentStack: Story = {
	args: {
		variant: "page",
		error: new Error("Error with component stack"),
		errorInfo: {
			componentStack: `
    in ErrorPage
    in Story
    in ThemeProvider`,
		},
	},
};
