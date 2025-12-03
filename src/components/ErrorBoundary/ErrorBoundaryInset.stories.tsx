import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Box } from "@radix-ui/themes";

import ErrorBoundaryInset from "./ErrorBoundaryInset";

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

const TechTreeContainerMock = () => (
	<div className="lg:col-span-1">
		<ErrorBoundaryInset>
			<ErrorTrigger />
		</ErrorBoundaryInset>
	</div>
);

const ErrorTrigger = () => {
	throw new Error(
		`Stack overflow in component\n    at TechTreeRow\n    at useTechTreeRow\n    at TechTree`
	);
};

export const InTechTreeLayoutLight: Story = {
	render: () => <TechTreeContainerMock />,
	args: {
		children: null,
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error boundary inset within tech tree layout in light mode.",
			},
		},
	},
};

export const InTechTreeLayoutDark: Story = {
	render: () => <TechTreeContainerMock />,
	args: {
		children: null,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error boundary inset within tech tree layout in dark mode.",
			},
		},
	},
};

const TechTreeWithLongError = () => (
	<ErrorBoundaryInset>
		<ErrorWithComponentStack />
	</ErrorBoundaryInset>
);

const ErrorWithComponentStack = () => {
	const error = new Error("Failed to render TechTreeRow");
	error.stack = `Error: Failed to render TechTreeRow
    at TechTreeRow (file:///src/components/TechTree/TechTreeRow.tsx:42:10)
    at TechTree (file:///src/components/TechTree/TechTree.tsx:88:5)
    at Suspense (file:///src/pages/App.tsx:15:3)
    at App (file:///src/pages/App.tsx:8:1)
    at renderWithHooks (file:///node_modules/react/index.js:1234:5)`;
	throw error;
};

export const WithLongStackTraceLight: Story = {
	render: () => <TechTreeWithLongError />,
	args: {
		children: null,
	},
	decorators: [(Story) => withRadixTheme("light")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error boundary inset with long stack trace in light mode.",
			},
		},
	},
};

export const WithLongStackTraceDark: Story = {
	render: () => <TechTreeWithLongError />,
	args: {
		children: null,
	},
	decorators: [(Story) => withRadixTheme("dark")(Story)],
	parameters: {
		docs: {
			description: {
				story: "Error boundary inset with long stack trace in dark mode.",
			},
		},
	},
};
