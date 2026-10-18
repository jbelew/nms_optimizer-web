import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import ShareLinkDialog from "./ShareLinkDialog";

const meta = {
	component: ShareLinkDialog,
	decorators: [
		(Story) => (
			<div
				className="flex min-h-screen items-center justify-center p-4"
				style={{ margin: "0 auto", maxWidth: "800px" }}
			>
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Modal dialog that presents a shareable Shared Grid URL and copy-to-clipboard action.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/AppDialog/ShareLink/ShareLinkDialog",
} satisfies Meta<typeof ShareLinkDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: true,
		onClose: () => {},
		shareUrl: "https://nms-optimizer.app/?platform=standard&grid=N4IgZiBcoA5Q",
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
	},
};
