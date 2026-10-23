import React from "react";
import { Theme } from "@radix-ui/themes";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { sendEvent } from "@/utils/analytics/tracking";

import { UpdatePrompt, UpdatePromptDialog } from "./UpdatePromptDialog";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key,
	}),
}));

vi.mock("@/utils/analytics/tracking", () => ({
	sendDeferredEvent: vi.fn(),
	sendEvent: vi.fn(),
}));

describe("UpdatePrompt & UpdatePromptDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	test("renders nothing initially before new-version-available event fires", () => {
		const { container } = render(
			<Theme>
				<UpdatePromptDialog />
			</Theme>,
		);

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(container).toBeInTheDocument();
	});

	test("renders dialog, sends analytics event, and handles dismiss and refresh when a newer version is verified", async () => {
		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					buildDate: "2099-01-01T00:00:00.000Z",
					version: "99.0.0",
				}),
				{ status: 200 },
			),
		);

		render(
			<Theme>
				<UpdatePromptDialog />
			</Theme>,
		);

		act(() => {
			window.dispatchEvent(
				new CustomEvent("new-version-available", { detail: mockUpdateSW }),
			);
		});

		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		expect(sendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
			}),
		);

		const refreshButton = screen.getByRole("button", { name: /refresh now/i });
		act(() => {
			refreshButton.click();
		});

		await vi.waitFor(() => {
			expect(mockUpdateSW).toHaveBeenCalledWith(true);
		});

		const laterButton = screen.getByRole("button", { name: /later/i });
		act(() => {
			laterButton.click();
		});

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	test("suppresses dialog and silently activates worker when version.json matches running client", async () => {
		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					buildDate: "test-date",
					version: "test-version",
				}),
				{ status: 200 },
			),
		);

		render(
			<Theme>
				<UpdatePromptDialog />
			</Theme>,
		);

		act(() => {
			window.dispatchEvent(
				new CustomEvent("new-version-available", { detail: mockUpdateSW }),
			);
		});

		await vi.waitFor(() => {
			expect(mockUpdateSW).toHaveBeenCalledWith(false);
		});

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	test("renders UpdatePrompt directly when controlled props are passed", () => {
		const onDismiss = vi.fn();
		const onRefresh = vi.fn();

		render(
			<Theme>
				<UpdatePrompt
					isOpen={true}
					onDismiss={onDismiss}
					onRefresh={onRefresh}
				/>
			</Theme>,
		);

		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});
});
