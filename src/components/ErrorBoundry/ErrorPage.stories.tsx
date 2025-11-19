import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorPage } from "./ErrorPage";

const meta = {
	component: ErrorPage,
	title: "components/ErrorBoundry/ErrorPage",
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof ErrorPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithErrorMessage: Story = {
	args: {
		error: new Error("This is a sample error message."),
	},
};

export const WithStackTrace: Story = {
	args: {
		error: {
			name: "Error",
			message: "Something went wrong",
			stack: `Error: Something went wrong
    at ErrorPage (http://localhost:6006/src/components/ErrorBoundry/ErrorPage.tsx:10:1)
    at renderWithHooks (http://localhost:6006/node_modules/.cache/sb/.vite-storybook/deps/chunk-QA6L6B62.js?v=1234:1234:1)
    at mountIndeterminateComponent (http://localhost:6006/node_modules/.cache/sb/.vite-storybook/deps/chunk-QA6L6B62.js?v=1234:1234:1)`,
		},
	},
};

export const WithComponentStack: Story = {
	args: {
		error: new Error("Error with component stack"),
		errorInfo: {
			componentStack: `
    in ErrorPage
    in Story
    in ThemeProvider`,
		},
	},
};
