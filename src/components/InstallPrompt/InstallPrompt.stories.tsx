import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { ToastRenderer } from "@/components/Toast/ToastRenderer";

import { INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt, USER_VISIT_KEY } from "./InstallPrompt";

const IOS_SAFARI_UA =
	"Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

const IosSafariDecoratorWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [{ originalMaxTouchPoints, originalUserAgent }] = React.useState(() => {
		const savedUserAgent = navigator.userAgent;
		const savedMaxTouchPoints = navigator.maxTouchPoints;

		localStorage.setItem(USER_VISIT_KEY, "true");
		localStorage.removeItem(INSTALL_PROMPT_DISMISSED_KEY);

		Object.defineProperty(navigator, "maxTouchPoints", {
			configurable: true,
			value: 1,
			writable: true,
		});
		Object.defineProperty(navigator, "userAgent", {
			configurable: true,
			value: IOS_SAFARI_UA,
			writable: true,
		});

		return {
			originalMaxTouchPoints: savedMaxTouchPoints,
			originalUserAgent: savedUserAgent,
		};
	});

	useEffect(() => {
		return () => {
			Object.defineProperty(navigator, "maxTouchPoints", {
				configurable: true,
				value: originalMaxTouchPoints,
				writable: true,
			});
			Object.defineProperty(navigator, "userAgent", {
				configurable: true,
				value: originalUserAgent,
				writable: true,
			});
		};
	}, [originalMaxTouchPoints, originalUserAgent]);

	return <>{children}</>;
};

const meta = {
	component: InstallPrompt,
	decorators: [
		(Story) => (
			<IosSafariDecoratorWrapper>
				<div className="mx-auto flex min-h-screen max-w-[800px] items-center justify-center p-4">
					<Story />
					<ToastRenderer />
				</div>
			</IosSafariDecoratorWrapper>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"PWA install guidance prompt for iOS Safari return visitors (Chromium/Android delegates to native browser install).",
			},
		},
	},
	title: "Components/InstallPrompt",
} satisfies Meta<typeof InstallPrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: "Displays a toast notification with 'Add to Home Screen' instructions on iOS Safari after the first visit.",
			},
		},
		layout: "fullscreen",
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toastDescription = await canvas.findByText(/in Safari or Chrome, then select/i);
		await expect(toastDescription).toBeInTheDocument();
		await expect(toastDescription).toHaveTextContent(
			/Tap Share in Safari or Chrome, then select Add to Home Screen to install this app\./i,
		);
		await expect(canvas.getAllByText(/Add to Home Screen/i).length).toBeGreaterThan(0);
	},
};
