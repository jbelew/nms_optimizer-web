import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";

import { ToastRenderer } from "@/components/Toast/ToastRenderer";
import { ToastProvider } from "@/hooks/useToast/useToast";

import { InstallPrompt } from "./InstallPrompt";

const IosSafariDecoratorWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	useEffect(() => {
		const originalUserAgent = navigator.userAgent;
		const originalMaxTouchPoints = navigator.maxTouchPoints;

		localStorage.setItem("userVisited", "true");
		localStorage.removeItem("installPromptDismissed");

		Object.defineProperty(navigator, "maxTouchPoints", {
			configurable: true,
			value: 1,
			writable: true,
		});
		Object.defineProperty(navigator, "userAgent", {
			configurable: true,
			value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
			writable: true,
		});

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
	}, []);

	return <>{children}</>;
};

const meta = {
	component: InstallPrompt,
	decorators: [
		(Story) => (
			<IosSafariDecoratorWrapper>
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<div className="mx-auto flex min-h-screen max-w-[800px] items-center justify-center p-4">
							<Story />
							<ToastRenderer />
						</div>
					</ToastProvider>
					<Toast.Viewport className="ToastViewport" />
				</Toast.Provider>
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
};
