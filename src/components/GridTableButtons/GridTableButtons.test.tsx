/// <reference types="@testing-library/jest-dom" />
import type { Mock } from "vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

import GridTableButtons from "./GridTableButtons";

const {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
} = vi.hoisted(() => ({
	markTutorialFinishedMock: vi.fn(),
	mockResetGrid: vi.fn(),
	mockSendEvent: vi.fn(),
	mockSetIsSharedGrid: vi.fn(),
	mockUpdateUrlForReset: vi.fn(),
	mockUpdateUrlForShare: vi.fn(() => "http://share.url"),
	openDialogMock: vi.fn(),
}));

const { setGridStoreState, useGridStore } = vi.hoisted(() => {
	let isSharedGrid = false;
	let hasModulesInGrid = true;

	const store = {
		hasModulesInGrid,
		isSharedGrid,
		resetGrid: mockResetGrid,
		selectHasModulesInGrid: () => hasModulesInGrid,
		setIsSharedGrid: mockSetIsSharedGrid,
	};

	const useGridStoreMock = vi.fn((selector?: (state: unknown) => unknown) => {
		const currentState = { ...store, hasModulesInGrid, isSharedGrid };

		if (typeof selector === "function") {
			return selector(currentState);
		}

		return currentState;
	});

	// Attach getState to the mock function itself
	Object.assign(useGridStoreMock, {
		getState: () => ({
			resetGrid: mockResetGrid,
		}),
	});

	return {
		setGridStoreState: (isShared: boolean, hasModules: boolean) => {
			isSharedGrid = isShared;
			hasModulesInGrid = hasModules;
		},
		useGridStore: useGridStoreMock,
	};
});

// Mock external modules and hooks
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => (key === "buttons.resetGrid" ? "Reset Grid Button" : key),
	}),
}));
vi.mock("@/components/ConditionalTooltip/ConditionalTooltip", () => ({
	ConditionalTooltip: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/hooks/useBreakpoint/useBreakpoint");
vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: () => ({
		markTutorialFinished: markTutorialFinishedMock,
		openDialog: openDialogMock,
		tutorialFinished: false,
	}),
}));
vi.mock("@/hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendDeferredEvent: vi.fn(),
		sendEvent: mockSendEvent,
	}),
}));
vi.mock("@/hooks/useOptimize/useOptimize");
vi.mock("@/hooks/useUrlSync/useUrlSync", () => ({
	useUrlSync: () => ({
		updateUrlForReset: mockUpdateUrlForReset,
		updateUrlForShare: mockUpdateUrlForShare,
	}),
}));
vi.mock("@/store/grid/gridStore", () => ({
	useGridStore: useGridStore,
}));
vi.mock("@/hooks/useBuildFileManager/useBuildFileManager", () => ({
	useBuildFileManager: () => ({
		loadBuildFromFile: vi.fn(),
		saveBuildToFile: vi.fn(),
	}),
}));
vi.mock("@/hooks/useToast/useToast", () => ({
	useToast: () => ({
		closeToast: vi.fn(),
		isOpen: false,
		showError: vi.fn(),
		showSuccess: vi.fn(),
		toastConfig: null,
	}),
}));
vi.mock("@/hooks/useScreenshot/useScreenshot", () => ({
	useScreenshot: () => ({
		handleScreenshot: vi.fn(),
		isCapturing: false,
	}),
}));

const mockGridRef = { current: document.createElement("div") } as React.RefObject<HTMLDivElement>;

describe("GridTableButtons", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(useBreakpoint as Mock).mockReturnValue(true); // Default to smallAndUp
		setGridStoreState(false, true); // Default to not shared, has modules
	});

	it("renders all buttons when not shared grid and has modules", () => {
		render(<GridTableButtons gridRef={mockGridRef} solving={false} />);
		expect(screen.getByLabelText("buttons.instructions")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.about")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.share")).toBeInTheDocument();
		expect(screen.getByLabelText("Reset Grid Button")).toBeInTheDocument();
	});

	it("does not render share button when isSharedGrid is true", () => {
		setGridStoreState(true, true); // Set shared grid to true
		render(<GridTableButtons gridRef={mockGridRef} solving={false} />);
		expect(screen.queryByLabelText("buttons.share")).not.toBeInTheDocument();
	});

	it("disables share button when solving is true", () => {
		render(<GridTableButtons gridRef={mockGridRef} solving={true} />);
		expect(screen.getByLabelText("buttons.share")).toBeDisabled();
	});

	it("disables share button when hasModulesInGrid is false", () => {
		setGridStoreState(false, false); // Set hasModulesInGrid to false
		render(<GridTableButtons gridRef={mockGridRef} solving={false} />);
		expect(screen.getByLabelText("buttons.share")).toBeDisabled();
	});

	it("disables reset button when solving is true", () => {
		render(<GridTableButtons gridRef={mockGridRef} solving={true} />);
		expect(screen.getByLabelText("Reset Grid Button")).toBeDisabled();
	});

	it("disables instructions button when solving is true", () => {
		render(<GridTableButtons gridRef={mockGridRef} solving={true} />);
		expect(screen.getByLabelText("buttons.instructions")).toBeDisabled();
	});

	it("disables about button when solving is true", () => {
		render(<GridTableButtons gridRef={mockGridRef} solving={true} />);
		expect(screen.getByLabelText("buttons.about")).toBeDisabled();
	});

	it("calls handleShowInstructions on instructions button click", () => {
		render(<GridTableButtons gridRef={mockGridRef} solving={false} />);
		fireEvent.click(screen.getByLabelText("buttons.instructions"));

		expect(openDialogMock).toHaveBeenCalledWith("instructions");
		expect(markTutorialFinishedMock).toHaveBeenCalled();
	});

	it("calls handleShowAboutPage on about button click", () => {
		render(<GridTableButtons gridRef={mockGridRef} solving={false} />);
		fireEvent.click(screen.getByLabelText("buttons.about"));

		expect(openDialogMock).toHaveBeenCalledWith("about");
	});

	it("calls handleShareClick and tracks GA event on share button click", () => {
		render(<GridTableButtons gridRef={mockGridRef} solving={false} />);
		fireEvent.click(screen.getByLabelText("buttons.share"));

		expect(mockUpdateUrlForShare).toHaveBeenCalled();
		expect(openDialogMock).toHaveBeenCalledWith(null, { shareUrl: "http://share.url" });
		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "share",
			category: "ui",
			method: "url",
			nonInteraction: false,
			value: 1,
		});
	});

	it("calls reset grid and related functions on reset button click", () => {
		render(<GridTableButtons gridRef={mockGridRef} solving={false} />);
		fireEvent.click(screen.getByText("Reset Grid Button"));

		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "reset_grid",
			category: "ui",
			nonInteraction: false,
			value: 1,
		});

		// Check that the functions inside handleResetGrid are called
		expect(mockResetGrid).toHaveBeenCalled();
		expect(mockUpdateUrlForReset).toHaveBeenCalled();
		expect(mockSetIsSharedGrid).toHaveBeenCalledWith(false);
	});
});
