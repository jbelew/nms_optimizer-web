import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorContent } from "./ErrorContent";

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

export const PageVariantLight: Story = {
	args: {
		variant: "page",
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with page variant in light mode.",
			},
		},
	},
};

export const PageVariantDark: Story = {
	args: {
		variant: "page",
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with page variant in dark mode.",
			},
		},
	},
};

export const InsetVariantLight: Story = {
	args: {
		variant: "inset",
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with inset variant in light mode.",
			},
		},
	},
};

export const InsetVariantDark: Story = {
	args: {
		variant: "inset",
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with inset variant in dark mode.",
			},
		},
	},
};

export const WithErrorMessageLight: Story = {
	args: {
		variant: "page",
		error: new Error("This is a sample error message."),
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with error message in light mode.",
			},
		},
	},
};

export const WithErrorMessageDark: Story = {
	args: {
		variant: "page",
		error: new Error("This is a sample error message."),
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with error message in dark mode.",
			},
		},
	},
};

export const WithStackTraceLight: Story = {
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
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with stack trace in light mode.",
			},
		},
	},
};

export const WithStackTraceDark: Story = {
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
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with stack trace in dark mode.",
			},
		},
	},
};

export const WithComponentStackLight: Story = {
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
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with component stack in light mode.",
			},
		},
	},
};

export const WithComponentStackDark: Story = {
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
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error content with component stack in dark mode.",
			},
		},
	},
};
