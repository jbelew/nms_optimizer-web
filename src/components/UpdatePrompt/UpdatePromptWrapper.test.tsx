import React from "react";
import { act, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useUpdateCheck } from "../../hooks/useUpdateCheck/useUpdateCheck";
import UpdatePromptWrapper from "./UpdatePromptWrapper";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock custom hooks
vi.mock("../../hooks/useUpdateCheck/useUpdateCheck", () => ({
	useUpdateCheck: vi.fn(),
}));

vi.mock("../../hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: vi.fn(),
}));

// Mock UpdatePrompt component
vi.mock("./UpdatePrompt", () => ({
	default: ({
		isOpen,
		onDismiss,
		onRefresh,
	}: {
		isOpen?: boolean;
		onDismiss?: () => void;
		onRefresh?: () => void;
	}) => {
		if (!isOpen) return null;

		return (
			<div data-testid="update-prompt" role="dialog">
				<button onClick={onRefresh}>Refresh</button>
				<button onClick={onDismiss}>Dismiss</button>
			</div>
		);
	},
}));

describe("UpdatePromptWrapper", () => {
	const mockSendEvent = vi.fn();
	let updateCallback: (updateSW: (reloadPage?: boolean) => Promise<void>) => void;

	beforeEach(() => {
		vi.clearAllMocks();
		(useAnalytics as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			sendDeferredEvent: vi.fn(),
			sendEvent: mockSendEvent,
		});
		(useUpdateCheck as unknown as ReturnType<typeof vi.fn>).mockImplementation((cb) => {
			updateCallback = cb;
		});
	});

	test("should not render initially", () => {
		const { container } = render(<UpdatePromptWrapper />);
		expect(container.firstChild).toBeNull();
	});

	test("should render when update is available", async () => {
		render(<UpdatePromptWrapper />);

		act(() => {
			updateCallback(vi.fn());
		});

		expect(await screen.findByTestId("update-prompt")).toBeInTheDocument();
	});

	test("should send analytics event when shown", async () => {
		render(<UpdatePromptWrapper />);

		act(() => {
			updateCallback(vi.fn());
		});

		expect(await screen.findByTestId("update-prompt")).toBeInTheDocument();
		expect(mockSendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
			})
		);
	});

	test("should handle dismiss", async () => {
		render(<UpdatePromptWrapper />);

		act(() => {
			updateCallback(vi.fn());
		});

		const dismissButton = await screen.findByText("Dismiss");
		act(() => {
			dismissButton.click();
		});

		expect(screen.queryByTestId("update-prompt")).not.toBeInTheDocument();
	});

	test("should handle refresh", async () => {
		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);
		render(<UpdatePromptWrapper />);

		act(() => {
			updateCallback(mockUpdateSW);
		});

		const refreshButton = await screen.findByText("Refresh");
		act(() => {
			refreshButton.click();
		});

		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});
});
