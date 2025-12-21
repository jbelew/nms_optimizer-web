import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useToast } from "@/hooks/useToast/useToast";
import { useErrorStore } from "@/store/ErrorStore";

import { ErrorMessageRenderer } from "./ErrorMessageRenderer";

// Mock dependencies
vi.mock("@/store/ErrorStore");
vi.mock("@/hooks/useToast/useToast");

// Manual mock for react-i18next to ensure useTranslation is a spy
const mockUseTranslation = vi.fn();
vi.mock("react-i18next", () => ({
	useTranslation: () => mockUseTranslation(),
}));

describe("ErrorMessageRenderer", () => {
	const mockShowError = vi.fn();
	const mockRemoveError = vi.fn();
	const mockTranslate = vi.fn((key) => key);

	beforeEach(() => {
		vi.clearAllMocks();

		// Default mocks
		vi.mocked(useToast).mockReturnValue({
			toastConfig: null,
			isOpen: false,
			showToast: vi.fn(),
			showSuccess: vi.fn(),
			showError: mockShowError,
			showInfo: vi.fn(),
			closeToast: vi.fn(),
		});

		mockUseTranslation.mockReturnValue({
			t: mockTranslate,
			i18n: {} as Record<string, unknown>,
			ready: true,
		});

		vi.mocked(useErrorStore).mockReturnValue({
			errors: [],
			removeError: mockRemoveError,
		} as Record<string, unknown>);
	});

	it("should display error when added to store", () => {
		const error = { id: "1", message: "Test Error", type: "error" as const };
		vi.mocked(useErrorStore).mockReturnValue({
			errors: [error],
			removeError: mockRemoveError,
		} as Record<string, unknown>);

		render(<ErrorMessageRenderer />);

		expect(mockShowError).toHaveBeenCalledWith("restrictions.title", "Test Error", 5000);
	});
});
