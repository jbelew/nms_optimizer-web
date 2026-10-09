import type { BeforeInstallPromptEvent } from "@/utils/browser/pwaInstall";
import * as Toast from "@radix-ui/react-toast";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastRenderer } from "@/components/Toast/ToastRenderer";
import { ToastProvider } from "@/hooks/useToast/useToast";
import { resetPwaInstallForTesting } from "@/utils/browser/pwaInstall";

import { INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt, USER_VISIT_KEY } from "./InstallPrompt";

vi.mock("react-i18next", () => ({
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
	useTranslation: () => ({
		t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
	}),
}));

describe("InstallPrompt", () => {
	beforeEach(() => {
		localStorage.clear();
		resetPwaInstallForTesting();
		vi.restoreAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
		resetPwaInstallForTesting();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	const renderComponent = () =>
		render(
			<Toast.Provider>
				<ToastProvider>
					<InstallPrompt />
					<ToastRenderer />
				</ToastProvider>
				<Toast.Viewport />
			</Toast.Provider>
		);

	it("should record first visit in localStorage and not show any prompt", () => {
		expect(localStorage.getItem(USER_VISIT_KEY)).toBeNull();

		renderComponent();

		expect(localStorage.getItem(USER_VISIT_KEY)).toBe("true");
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("should not prompt if already running in standalone mode", () => {
		localStorage.setItem(USER_VISIT_KEY, "true");

		vi.stubGlobal("window", {
			...window,
			matchMedia: (query: string) => ({
				matches: query === "(display-mode: standalone)",
			}),
		});

		renderComponent();

		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("should not prompt if previously dismissed", () => {
		localStorage.setItem(USER_VISIT_KEY, "true");
		localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "true");

		renderComponent();

		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("should show iOS instructions for return visitors on iOS Safari", () => {
		localStorage.setItem(USER_VISIT_KEY, "true");

		vi.stubGlobal("navigator", {
			userAgent:
				"Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
		});

		renderComponent();

		expect(screen.getByText("installPrompt.iosInstructions")).toBeInTheDocument();
		expect(localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY)).toBe("true");
	});

	const createMockPromptEvent = () => {
		const mockPrompt = vi.fn().mockResolvedValue(undefined);
		const promptEvent = new Event("beforeinstallprompt") as BeforeInstallPromptEvent;
		Object.defineProperty(promptEvent, "platforms", { value: ["web"] });
		Object.defineProperty(promptEvent, "prompt", { value: mockPrompt });
		Object.defineProperty(promptEvent, "userChoice", {
			value: Promise.resolve({ outcome: "accepted", platform: "web" }),
		});

		return { mockPrompt, promptEvent };
	};

	it("should show native install prompt when beforeinstallprompt fires and handle install click", async () => {
		localStorage.setItem(USER_VISIT_KEY, "true");

		const { mockPrompt, promptEvent } = createMockPromptEvent();

		renderComponent();

		act(() => {
			window.dispatchEvent(promptEvent);
		});

		expect(screen.getByText("Install App")).toBeInTheDocument();
		const installButton = screen.getByRole("button", { name: "Install" });
		expect(installButton).toBeInTheDocument();

		await act(async () => {
			fireEvent.click(installButton);
		});

		expect(mockPrompt).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY)).toBe("true");
	});

	it("should show install prompt even when beforeinstallprompt fired before component mounted", async () => {
		localStorage.setItem(USER_VISIT_KEY, "true");

		const { mockPrompt, promptEvent } = createMockPromptEvent();

		// Fire event BEFORE component mounts (simulating idle mount delay)
		act(() => {
			window.dispatchEvent(promptEvent);
		});

		renderComponent();

		expect(screen.getByText("Install App")).toBeInTheDocument();
		const installButton = screen.getByRole("button", { name: "Install" });
		expect(installButton).toBeInTheDocument();

		await act(async () => {
			fireEvent.click(installButton);
		});

		expect(mockPrompt).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY)).toBe("true");
	});

	it("should not show prompt on unsupported browsers without beforeinstallprompt", () => {
		localStorage.setItem(USER_VISIT_KEY, "true");

		vi.stubGlobal("navigator", {
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
		});

		renderComponent();

		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});
});
