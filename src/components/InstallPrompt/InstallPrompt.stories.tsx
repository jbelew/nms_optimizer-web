import type { Meta, StoryObj } from "@storybook/react-vite";
import { I18nextProvider } from "react-i18next";

import i18n from "../../i18n/i18n";
import { InstallPrompt } from "./InstallPrompt";

const meta = {
	component: InstallPrompt,
	title: "components/InstallPrompt",
	decorators: [
		(Story) => (
			<I18nextProvider i18n={i18n}>
				<Story />
			</I18nextProvider>
		),
	],
} satisfies Meta<typeof InstallPrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onDismiss: () => {},
	},
};
