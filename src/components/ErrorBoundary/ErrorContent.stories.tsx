import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { ErrorContent } from "./ErrorBoundary";

const HUMAN_CHROME_UA =
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

/**
 * Extended `Navigator` shape exposing User-Agent Client Hints in Chromium test environments.
 */
interface NavigatorWithUAData extends Navigator {
	/** Optional User-Agent Client Hints object. */
	userAgentData?: unknown;
}

const meta = {
	argTypes: {
		variant: {
			control: "radio",
			options: ["page", "inset"],
		},
	},
	beforeEach: () => {
		const nav = navigator as NavigatorWithUAData;
		const originalUserAgent = navigator.userAgent;
		const originalWebdriver = navigator.webdriver;
		const originalUserAgentData = nav.userAgentData;
		const hadBotClass = document.documentElement.classList.contains("is-bot");

		document.documentElement.classList.remove("is-bot");
		Object.defineProperty(navigator, "webdriver", {
			configurable: true,
			value: false,
		});
		Object.defineProperty(navigator, "userAgent", {
			configurable: true,
			value: HUMAN_CHROME_UA,
		});
		Object.defineProperty(navigator, "userAgentData", {
			configurable: true,
			value: {
				brands: [{ brand: "Google Chrome", version: "135" }],
			},
		});

		return () => {
			if (hadBotClass) {
				document.documentElement.classList.add("is-bot");
			}

			Object.defineProperty(navigator, "webdriver", {
				configurable: true,
				value: originalWebdriver,
			});
			Object.defineProperty(navigator, "userAgent", {
				configurable: true,
				value: originalUserAgent,
			});
			Object.defineProperty(navigator, "userAgentData", {
				configurable: true,
				value: originalUserAgentData,
			});
		};
	},
	component: ErrorContent,
	parameters: {
		layout: "fullscreen",
	},
	title: "Components/ErrorBoundary/ErrorContent",
} satisfies Meta<typeof ErrorContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PageVariant: Story = {
	args: {
		variant: "page",
	},
	parameters: {
		docs: {
			description: {
				story: "Error content with page variant.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByRole("heading", { level: 2 })).toBeInTheDocument();
		await expect(canvas.getByRole("link")).toHaveAttribute(
			"href",
			"https://github.com/jbelew/nms_optimizer-web/issues",
		);
	},
};

export const WithErrorMessage: Story = {
	args: {
		error: {
			message: "This is a sample error message.",
			name: "Error",
		},
		variant: "page",
	},
	parameters: {
		docs: {
			description: {
				story: "Error content with error message.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText(/This is a sample error message\./i),
		).toBeInTheDocument();
	},
};

export const WithStackTrace: Story = {
	args: {
		error: {
			message: "Something went wrong",
			name: "Error",
			stack: `Error: Something went wrong
    at ErrorPage (http://localhost:5173/src/components/ErrorBoundary/ErrorPage.tsx:10:1)
    at renderWithHooks (http://localhost:5173/node_modules/react/index.js:200:45)
    at mountIndeterminateComponent (http://localhost:5173/node_modules/react/index.js:500:30)`,
		},
		variant: "page",
	},
	parameters: {
		docs: {
			description: {
				story: "Error content with stack trace.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect((await canvas.findAllByText(/Something went wrong/i)).length).toBeGreaterThan(
			0,
		);
		await expect(canvas.getByText(/mountIndeterminateComponent/i)).toBeInTheDocument();
	},
};

export const WithComponentStack: Story = {
	args: {
		error: {
			message: "Error with component stack",
			name: "Error",
		},
		errorInfo: {
			componentStack: `
    in ErrorPage
    in Story
    in ThemeProvider`,
		},
		variant: "page",
	},
	parameters: {
		docs: {
			description: {
				story: "Error content with component stack.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText(/Error with component stack/i)).toBeInTheDocument();
		await expect(canvas.getByText(/in ThemeProvider/i)).toBeInTheDocument();
	},
};
