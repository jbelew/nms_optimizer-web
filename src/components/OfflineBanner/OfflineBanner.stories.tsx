import type { Meta, StoryObj } from "@storybook/react-vite";

import OfflineBanner from "./OfflineBanner";

const meta = {
	component: OfflineBanner,
	title: "components/OfflineBanner",
	parameters: {
		layout: "fullscreen",
		backgrounds: {
			default: "Default",
			values: [{ name: "Default", value: "var(--color-background)" }],
		},
	},
	decorators: [
		(Story) => {
			// Mock navigator.onLine to return false for the story
			Object.defineProperty(navigator, "onLine", {
				writable: true,
				value: false,
			});

			return <Story />;
		},
	],
} satisfies Meta<typeof OfflineBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Offline: Story = {};
