import type { Meta, StoryObj } from "@storybook/react-vite";

import OfflineBanner from "./OfflineBanner";

const meta = {
	component: OfflineBanner,
	title: "components/OfflineBanner",
} satisfies Meta<typeof OfflineBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
