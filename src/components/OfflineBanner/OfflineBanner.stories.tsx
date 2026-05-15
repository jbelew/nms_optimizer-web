import type { Meta, StoryObj } from "@storybook/react-vite";

import OfflineBanner from "./OfflineBanner";

const meta = {
	component: OfflineBanner,
	decorators: [
		(Story) => {
			// Mock navigator.onLine to return false for the story
			Object.defineProperty(navigator, "onLine", {
				value: false,
				writable: true,
			});

			return <Story />;
		},
	],
	parameters: {
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
		layout: "fullscreen",
	},
	title: "components/OfflineBanner",
} satisfies Meta<typeof OfflineBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Offline: Story = {
	render: (args) => <OfflineBanner {...args} />,
};
