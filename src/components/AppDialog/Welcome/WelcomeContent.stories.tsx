import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@radix-ui/themes";
import { expect, screen } from "storybook/test";

import AppDialog from "@/components/AppDialog/Base/AppDialog";

import WelcomeContent from "./WelcomeContent";

const meta = {
	component: WelcomeContent,
	decorators: [
		(Story) => (
			<div
				className="flex min-h-screen items-center justify-center p-4"
				style={{ margin: "0 auto", maxWidth: "800px" }}
			>
				<AppDialog
					content={<Story />}
					footer={
						<div className="flex justify-end gap-2">
							<Button variant="solid">Get Started!</Button>
						</div>
					}
					isOpen={true}
					onClose={() => {}}
					title="Welcome!"
					titleKey="welcome"
				/>
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Initial onboarding dialog content introducing core workspace interactions and terminology.",
			},
		},
		layout: "fullscreen",
	},
	title: "Components/AppDialog/Welcome/WelcomeContent",
} satisfies Meta<typeof WelcomeContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onClose: () => {},
	},
	play: async () => {
		const dialog = await screen.findByRole("dialog");
		await expect(dialog).toBeInTheDocument();
	},
};
