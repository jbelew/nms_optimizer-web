import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { t } from "i18next";

import { useOptimizeStore } from "../../store/OptimizeStore";
import AppDialog from "./AppDialog";
import ErrorContent from "./ErrorContent";

const meta = {
	component: ErrorContent,
	title: "Components/AppDialog/ErrorContent",
	render: (args) => (
		<AppDialog
			isOpen={true}
			titleKey="dialogs.titles.serverError"
			title={t("dialogs.titles.serverError")}
			onClose={() => console.log("Dialog closed")}
			content={<ErrorContent {...args} />}
		/>
	),
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
} satisfies Meta<typeof ErrorContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onClose: () => console.log("Dialog closed"),
	},
	decorators: [
		(Story) => {
			// Set fatal error type before rendering
			React.useEffect(() => {
				useOptimizeStore.setState({ errorType: "fatal" });

				return () => {
					useOptimizeStore.setState({ errorType: undefined });
				};
			}, []);

			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: "Error Content Dialog with fatal error type. Shows a Retry button instead of Close.",
			},
		},
	},
};
