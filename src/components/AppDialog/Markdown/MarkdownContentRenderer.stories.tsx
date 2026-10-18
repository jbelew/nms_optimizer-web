import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@radix-ui/themes";
import { expect, screen, within } from "storybook/test";

import AppDialog from "@/components/AppDialog/Base/AppDialog";

import { MarkdownContentRenderer } from "./MarkdownContentRenderer";

const meta = {
	component: MarkdownContentRenderer,
	decorators: [
		(Story, context) => {
			const pageId =
				context.args.markdownFileName === "instructions" ? "instructions"
				: context.args.markdownFileName === "changelog" ? "changelog"
				: "about";

			return (
				<div className="mx-auto flex min-h-screen max-w-[800px] items-center justify-center p-4">
					<AppDialog
						content={
							<React.Suspense fallback={null}>
								<Story />
							</React.Suspense>
						}
						footer={
							<div className="flex justify-end gap-2">
								<Button variant="soft">Close</Button>
							</div>
						}
						isOpen={true}
						onClose={() => {}}
						pageId={pageId}
					/>
				</div>
			);
		},
	],
	parameters: {
		docs: {
			description: {
				component:
					"Renders localized markdown content inside a Routed Dialog with Radix UI typography, custom shortcodes, and section deep-linking.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/AppDialog/Markdown/MarkdownContentRenderer",
} satisfies Meta<typeof MarkdownContentRenderer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AboutDialog: Story = {
	args: {
		markdownFileName: "about",
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
		const heading = await within(dialog).findByRole(
			"heading",
			{
				name: /How the Layout Optimization Engine Works/i,
			},
			{ timeout: 5000 },
		);
		await expect(heading).toBeInTheDocument();
	},
};

export const InstructionsDialog: Story = {
	args: {
		markdownFileName: "instructions",
		targetSectionId: "section-1",
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
		const heading = await within(dialog).findByRole(
			"heading",
			{
				name: /Getting Started/i,
			},
			{ timeout: 5000 },
		);
		await expect(heading).toBeInTheDocument();
	},
};

export const ChangelogDialog: Story = {
	args: {
		markdownFileName: "changelog",
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
		const heading = await within(dialog).findByRole(
			"heading",
			{
				name: /8\.3/i,
			},
			{ timeout: 5000 },
		);
		await expect(heading).toBeInTheDocument();
	},
};
