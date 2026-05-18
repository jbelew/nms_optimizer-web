import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { useOptimizeStore } from "@/store/app/optimizeStore";

import { ErrorDialog } from "./errorDialog";

const meta = {
	component: ErrorDialog,
	decorators: [
		(Story) => {
			return (
				<div
					className="flex min-h-screen items-center justify-center p-4"
					style={{ margin: "0 auto", maxWidth: "800px" }}
				>
					<Story />
				</div>
			);
		},
	],
	title: "Components/AppDialog/Error/ErrorDialog",
} satisfies Meta<typeof ErrorDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	decorators: [
		(Story) => {
			// Set error state before rendering
			React.useEffect(() => {
				useOptimizeStore.setState({
					status: { details: null, severity: "recoverable", type: "error" },
				});

				return () => {
					useOptimizeStore.setState({ status: { type: "idle" } });
				};
			}, []);

			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: "Error Dialog. Shows a generic server error message with a Close button.",
			},
		},
		layout: "fullscreen",
	},
};
