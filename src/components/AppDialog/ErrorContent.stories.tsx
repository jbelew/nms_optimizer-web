import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { t } from "i18next";

import AppDialog from "./AppDialog";
import ErrorContent from "./ErrorContent";

const meta = {
	component: ErrorContent,
	title: "components/AppDialog/ErrorContent",
	render: (args) => (
		<AppDialog
			isOpen={true}
			titleKey="dialogs.titles.serverError"
			title={t("dialogs.titles.serverError")}
			onClose={() => console.log("Dialog closed")}
			content={<ErrorContent {...args} />}
		/>
	),
} satisfies Meta<typeof ErrorContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onClose: () => console.log("Dialog closed"),
	},
};
