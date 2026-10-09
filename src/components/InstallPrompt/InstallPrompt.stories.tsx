import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";

import { ToastRenderer } from "@/components/Toast/ToastRenderer";
import { ToastProvider } from "@/hooks/useToast/useToast";
import { resetPwaInstallForTesting } from "@/utils/browser/pwaInstall";

import { InstallPrompt } from "./InstallPrompt";

const meta = {
	component: InstallPrompt,
	decorators: [
		(Story) => {
			// Seed localStorage so the component thinks this is a return visit
			localStorage.setItem("userVisited", "true");
			localStorage.removeItem("installPromptDismissed");

			// Mock touch device and iOS Safari so isIosSafari() returns true
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

			return (
				<Toast.Provider swipeDirection="right">
					<ToastProvider>
						<div
							className="flex min-h-screen items-center justify-center p-4"
							style={{ margin: "0 auto", maxWidth: "800px" }}
						>
							<Story />
							<ToastRenderer />
						</div>
					</ToastProvider>
					<Toast.Viewport className="ToastViewport" />
				</Toast.Provider>
			);
		},
	],
	parameters: {
		docs: {
			description: {
				component: "Prompt to ask user to install the app as a PWA.",
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
				story: "Install prompt component. Displays a toast notification prompting users to install the app, shown only on touch devices after the first visit (if not already installed).",
			},
		},
		layout: "fullscreen",
	},
};

/**
 * Wrapper to safely configure Android user agent and dispatch beforeinstallprompt inside an effect.
 */
const AndroidStoryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	useEffect(() => {
		const originalUserAgent = navigator.userAgent;
		Object.defineProperty(navigator, "userAgent", {
			configurable: true,
			value: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.113 Mobile Safari/537.36",
			writable: true,
		});

		const event = new Event("beforeinstallprompt");
		Object.defineProperty(event, "platforms", { value: ["android"] });
		Object.defineProperty(event, "prompt", {
			value: async () => {
				window.alert("Simulated Native Android Install Dialog");
			},
		});
		Object.defineProperty(event, "userChoice", {
			value: Promise.resolve({ outcome: "accepted", platform: "android" }),
		});
		window.dispatchEvent(event);

		return () => {
			Object.defineProperty(navigator, "userAgent", {
				configurable: true,
				value: originalUserAgent,
				writable: true,
			});
			resetPwaInstallForTesting();
		};
	}, []);

	return <>{children}</>;
};

export const AndroidChromium: Story = {
	decorators: [
		(Story) => {
			localStorage.setItem("userVisited", "true");
			localStorage.removeItem("installPromptDismissed");

			return (
				<AndroidStoryWrapper>
					<Story />
				</AndroidStoryWrapper>
			);
		},
	],
	parameters: {
		docs: {
			description: {
				story: "Android / Chromium install prompt with direct interactive 'Install' button triggering native prompt.",
			},
		},
		layout: "fullscreen",
	},
};
