import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorContent } from "./ErrorContent";

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
	title: "components/ErrorBoundary/ErrorContent",
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
};
