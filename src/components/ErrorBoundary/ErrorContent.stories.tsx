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
		variant: "page",
		error: new Error("This is a sample error message."),
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
		variant: "page",
		error: {
			name: "Error",
			message: "Something went wrong",
			stack: `Error: Something went wrong
    at ErrorPage (http://localhost:5173/src/components/ErrorBoundary/ErrorPage.tsx:10:1)
    at renderWithHooks (http://localhost:5173/node_modules/react/index.js:200:45)
    at mountIndeterminateComponent (http://localhost:5173/node_modules/react/index.js:500:30)`,
		},
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
		variant: "page",
		error: new Error("Error with component stack"),
		errorInfo: {
			componentStack: `
    in ErrorPage
    in Story
    in ThemeProvider`,
		},
	},
	parameters: {
		docs: {
			description: {
				story: "Error content with component stack.",
			},
		},
	},
};
