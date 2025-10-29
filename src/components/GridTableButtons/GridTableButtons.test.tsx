/// <reference types="@testing-library/jest-dom" />
import type { Mock } from "vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useOptimize } from "../../hooks/useOptimize/useOptimize";
import GridTableButtons from "./GridTableButtons";

const {
	mockSetIsSharedGrid,
	mockResetGrid,
	mockUpdateUrlForShare,
	mockUpdateUrlForReset,
	mockSendEvent,
	openDialogMock,
	markTutorialFinishedMock,
} = vi.hoisted(() => ({
	mockSetIsSharedGrid: vi.fn(),
	mockResetGrid: vi.fn(),
	mockUpdateUrlForShare: vi.fn(() => "http://share.url"),
	mockUpdateUrlForReset: vi.fn(),
	mockSendEvent: vi.fn(),
	openDialogMock: vi.fn(),
	markTutorialFinishedMock: vi.fn(),
}));

const { useGridStore, setGridStoreState } = vi.hoisted(() => {
	let isSharedGrid = false;
	let hasModulesInGrid = true;

	const store = {
		isSharedGrid,
		hasModulesInGrid,
		setIsSharedGrid: mockSetIsSharedGrid,
		resetGrid: mockResetGrid,
		selectHasModulesInGrid: () => hasModulesInGrid,
	};

	const useGridStoreMock = vi.fn((selector?: (state: unknown) => unknown) => {
		const currentState = { ...store, isSharedGrid, hasModulesInGrid };
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
		useGridStore: useGridStoreMock,
		setGridStoreState: (isShared: boolean, hasModules: boolean) => {
			isSharedGrid = isShared;
			hasModulesInGrid = hasModules;
		},
	};
});

// Mock external modules and hooks
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => (key === "buttons.resetGrid" ? "Reset Grid Button" : key),
	}),
}));
vi.mock("../../hooks/useBreakpoint/useBreakpoint");
vi.mock("../../context/dialog-utils", () => ({
	useDialog: () => ({
		openDialog: openDialogMock,
		tutorialFinished: false,
		markTutorialFinished: markTutorialFinishedMock,
	}),
}));
vi.mock("../../hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendEvent: mockSendEvent,
	}),
}));
vi.mock("../../hooks/useOptimize/useOptimize");
vi.mock("../../hooks/useUrlSync/useUrlSync", () => ({
	useUrlSync: () => ({
		updateUrlForShare: mockUpdateUrlForShare,
		updateUrlForReset: mockUpdateUrlForReset,
	}),
}));
vi.mock("../../store/GridStore", () => ({
	useGridStore: useGridStore,
}));

describe("GridTableButtons", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(useBreakpoint as Mock).mockReturnValue(true); // Default to smallAndUp
		(useOptimize as Mock).mockReturnValue({
			solving: false,
			gridContainerRef: { current: null },
		});
		setGridStoreState(false, true); // Default to not shared, has modules
	});

	it("renders all buttons when not shared grid and has modules", () => {
		render(<GridTableButtons />);
		expect(screen.getByLabelText("buttons.instructions")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.about")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.share")).toBeInTheDocument();
		expect(screen.getByLabelText("Reset Grid Button")).toBeInTheDocument();
	});

	it("does not render share button when isSharedGrid is true", () => {
		setGridStoreState(true, true); // Set shared grid to true
		render(<GridTableButtons />);
		expect(screen.queryByLabelText("buttons.share")).not.toBeInTheDocument();
	});

	it("disables share button when solving is true", () => {
		(useOptimize as Mock).mockReturnValue({
			solving: true,
			gridContainerRef: { current: null },
		});
		render(<GridTableButtons />);
		expect(screen.getByLabelText("buttons.share")).toBeDisabled();
	});

	it("disables share button when hasModulesInGrid is false", () => {
		setGridStoreState(false, false); // Set hasModulesInGrid to false
		render(<GridTableButtons />);
		expect(screen.getByLabelText("buttons.share")).toBeDisabled();
	});

	it("disables reset button when solving is true", () => {
		(useOptimize as Mock).mockReturnValue({
			solving: true,
			gridContainerRef: { current: null },
		});
		render(<GridTableButtons />);
		expect(screen.getByLabelText("Reset Grid Button")).toBeDisabled();
	});

	it("calls handleShowInstructions and tracks GA event on instructions button click", () => {
		render(<GridTableButtons />);
		fireEvent.click(screen.getByLabelText("buttons.instructions"));

		expect(openDialogMock).toHaveBeenCalledWith("instructions");
		expect(markTutorialFinishedMock).toHaveBeenCalled();
		expect(mockSendEvent).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "showInstructions",
			value: 1,
		});
	});

	it("calls handleShowAboutPage and tracks GA event on about button click", () => {
		render(<GridTableButtons />);
		fireEvent.click(screen.getByLabelText("buttons.about"));

		expect(openDialogMock).toHaveBeenCalledWith("about");
		expect(mockSendEvent).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "showAbout",
			value: 1,
		});
	});

	it("calls handleShareClick and tracks GA event on share button click", () => {
		render(<GridTableButtons />);
		fireEvent.click(screen.getByLabelText("buttons.share"));

		expect(mockUpdateUrlForShare).toHaveBeenCalled();
		expect(openDialogMock).toHaveBeenCalledWith(null, { shareUrl: "http://share.url" });
		expect(mockSendEvent).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "shareLink",
			value: 1,
		});
	});

	it("calls reset grid and related functions on reset button click", () => {
		render(<GridTableButtons />);
		fireEvent.click(screen.getByText("Reset Grid Button"));

		expect(mockSendEvent).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "resetGrid",
			value: 1,
		});

		// Check that the functions inside handleResetGrid are called
		expect(mockResetGrid).toHaveBeenCalled();
		expect(mockUpdateUrlForReset).toHaveBeenCalled();
		expect(mockSetIsSharedGrid).toHaveBeenCalledWith(false);
	});
});
