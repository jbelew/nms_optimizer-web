import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { useOptimizeStore } from "../../../store/app/optimizeStore";
import ErrorDialog from "./ErrorDialog";

const meta = {
	component: ErrorDialog,
	title: "Components/AppDialog/Error/ErrorDialog",
	decorators: [
		(Story) => {
			return (
				<div
					className="flex min-h-screen items-center justify-center p-4"
					style={{ maxWidth: "800px", margin: "0 auto" }}
				>
					<Story />
				</div>
			);
		},
	],
} satisfies Meta<typeof ErrorDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	decorators: [
		(Story) => {
			// Set error state before rendering
			React.useEffect(() => {
				useOptimizeStore.setState({ showError: true });

				return () => {
					useOptimizeStore.setState({ showError: false });
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
