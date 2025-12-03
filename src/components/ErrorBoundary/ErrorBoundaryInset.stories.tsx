import type { Meta, StoryObj } from "@storybook/react-vite";
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

export const InTechTreeLayout: Story = {
	render: () => <TechTreeContainerMock />,
	args: {
		children: null,
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

export const WithLongStackTrace: Story = {
	render: () => <TechTreeWithLongError />,
	args: {
		children: null,
	},
};
