/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PageName } from "@/routeConfig";
import type * as dialogUtilsModule from "@/utils/system/dialogUtils";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import {
	__resetScrollGridIntoViewRef,
	useScrollGridIntoView,
} from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useTechStore } from "@/store/tech/techStore";

import GridTableButtons from "./GridTableButtons";

const {
	markTutorialFinishedMock,
	mockDialogState,
	mockHandleScreenshot,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	openDialogMock,
} = vi.hoisted(() => ({
	markTutorialFinishedMock: vi.fn(),
	mockDialogState: {
		lang: "en",
		search: "",
	},
	mockHandleScreenshot: vi.fn(),
	mockResetGrid: vi.fn(),
	mockSendEvent: vi.fn(),
	mockSetIsSharedGrid: vi.fn(),
	openDialogMock: vi.fn(),
}));

const { setGridStoreState, useGridStore } = vi.hoisted(() => {
	let isSharedGrid = false;
	let hasModulesInGrid = true;
	let isDefaultGrid = false;

	const store = {
		hasModulesInGrid,
		isDefaultGrid,
		isSharedGrid,
		resetGrid: mockResetGrid,
		setIsSharedGrid: mockSetIsSharedGrid,
	};

	const useGridStoreMock = vi.fn((selector?: (state: unknown) => unknown) => {
		const currentState = { ...store, hasModulesInGrid, isDefaultGrid, isSharedGrid };

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
		setGridStoreState: (
			isShared: boolean,
			hasModules: boolean,
			isDefault: boolean = !hasModules && !isShared,
		) => {
			isSharedGrid = isShared;
			hasModulesInGrid = hasModules;
			isDefaultGrid = isDefault;
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
vi.mock("@/utils/system/dialogUtils", async (importOriginal) => {
	const actual = await importOriginal<typeof dialogUtilsModule>();

	return {
		...actual,
		useDialog: () => ({
			getDialogHref: (dialog: PageName) =>
				actual.buildRoutedDialogHref(dialog, mockDialogState.lang, mockDialogState.search),
			markTutorialFinished: markTutorialFinishedMock,
			openDialog: openDialogMock,
			tutorialFinished: false,
		}),
	};
});
vi.mock("@/utils/analytics/tracking", () => ({
	sendDeferredEvent: vi.fn(),
	sendEvent: mockSendEvent,
}));
vi.mock("@/hooks/useOptimize/useOptimize");
vi.mock("@/store/grid/gridStore", () => ({
	useGridStore: useGridStore,
}));
vi.mock("@/hooks/useBuildFileManager/useBuildFileManager", () => ({
	useBuildFileManager: () => ({
		fileInputRef: { current: null },
		handleBuildNameCancel: vi.fn(),
		handleBuildNameConfirm: vi.fn(),
		handleFileSelect: vi.fn(),
		handleLoadBuild: vi.fn(),
		handleSaveBuild: vi.fn(),
		isLoadPending: false,
		isSaveBuildDialogOpen: false,
		isSavePending: false,
	}),
}));
vi.mock("@/hooks/useScreenshot/useScreenshot", () => ({
	useScreenshot: () => ({
		handleScreenshot: mockHandleScreenshot,
		isCapturing: false,
	}),
}));

const renderComponent = (solving = false) => {
	return render(
		<div className="main-app__grid-section">
			<GridTableButtons solving={solving} />
		</div>,
	);
};

describe("GridTableButtons", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		__resetScrollGridIntoViewRef();
		mockDialogState.lang = "en";
		mockDialogState.search = "";
		vi.mocked(useBreakpoint).mockReturnValue(true); // Default to smallAndUp
		setGridStoreState(false, true); // Default to not shared, has modules
		useTechStore.setState({ isDefaultModuleSelection: true });
	});

	it("does not mount BuildNameDialog or attach a window keydown listener while isSaveBuildDialogOpen is false", () => {
		const addEventListenerSpy = vi.spyOn(window, "addEventListener");
		renderComponent(false);

		const keydownCalls = addEventListenerSpy.mock.calls.filter((call) => call[0] === "keydown");
		expect(keydownCalls).toHaveLength(0);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

		addEventListenerSpy.mockRestore();
	});

	it("renders all buttons when not shared grid and has modules", () => {
		renderComponent(false);
		expect(screen.getByLabelText("buttons.instructions")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.about")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.share")).toBeInTheDocument();
		expect(screen.getByLabelText("Reset Grid Button")).toBeInTheDocument();
	});

	it("captures the enclosing .main-app__grid-section when screenshot button is clicked", () => {
		const { container } = renderComponent(false);
		const section = container.querySelector(".main-app__grid-section");
		fireEvent.click(screen.getByLabelText("buttons.screenshot"));
		expect(mockHandleScreenshot).toHaveBeenCalledWith(section);
	});

	it("does not render share button when isSharedGrid is true", () => {
		setGridStoreState(true, true); // Set shared grid to true
		renderComponent(false);
		expect(screen.queryByLabelText("buttons.share")).not.toBeInTheDocument();
	});

	it("disables share button when solving is true", () => {
		renderComponent(true);
		expect(screen.getByLabelText("buttons.share")).toBeDisabled();
	});

	it("disables share button when hasModulesInGrid is false", () => {
		setGridStoreState(false, false); // Set hasModulesInGrid to false
		renderComponent(false);
		expect(screen.getByLabelText("buttons.share")).toBeDisabled();
	});

	it("disables reset button when solving is true", () => {
		renderComponent(true);
		expect(screen.getByLabelText("Reset Grid Button")).toBeDisabled();
	});

	it("disables reset button when both isDefaultGrid and isDefaultModuleSelection are true", () => {
		setGridStoreState(false, false, true);
		useTechStore.setState({ isDefaultModuleSelection: true });
		renderComponent(false);
		expect(screen.getByLabelText("Reset Grid Button")).toBeDisabled();
	});

	it("enables reset button when isDefaultGrid is false even without modules in grid", () => {
		setGridStoreState(false, false, false);
		renderComponent(false);
		expect(screen.getByLabelText("Reset Grid Button")).not.toBeDisabled();
	});

	it("enables reset button when isDefaultGrid is true but isDefaultModuleSelection is false", () => {
		setGridStoreState(false, false, true);
		useTechStore.setState({ isDefaultModuleSelection: false });
		renderComponent(false);
		expect(screen.getByLabelText("Reset Grid Button")).not.toBeDisabled();
	});

	it("disables instructions link when solving is true and restores interactive link when idle", () => {
		const { rerender } = renderComponent(true);
		const instructionsLink = screen.getByRole("link", { name: "buttons.instructions" });

		expect(instructionsLink).toHaveAttribute("aria-disabled", "true");
		expect(instructionsLink).toHaveAttribute("data-disabled", "true");
		expect(instructionsLink).toHaveAttribute("tabindex", "-1");
		expect(fireEvent.click(instructionsLink)).toBe(false);
		expect(fireEvent.click(instructionsLink, { button: 0, ctrlKey: true })).toBe(false);
		expect(openDialogMock).not.toHaveBeenCalled();

		rerender(
			<div className="main-app__grid-section">
				<GridTableButtons solving={false} />
			</div>,
		);

		expect(instructionsLink).not.toHaveAttribute("aria-disabled");
		expect(instructionsLink).not.toHaveAttribute("data-disabled");
		expect(instructionsLink).not.toHaveAttribute("tabindex");
		expect(fireEvent.click(instructionsLink)).toBe(false);
		expect(openDialogMock).toHaveBeenCalledWith("instructions");
	});

	it("disables about link when solving is true and blocks navigation on click", () => {
		renderComponent(true);
		const aboutLink = screen.getByRole("link", { name: "buttons.about" });

		expect(aboutLink).toHaveAttribute("aria-disabled", "true");
		expect(aboutLink).toHaveAttribute("data-disabled", "true");
		expect(aboutLink).toHaveAttribute("tabindex", "-1");
		expect(fireEvent.click(aboutLink)).toBe(false);
		expect(openDialogMock).not.toHaveBeenCalled();
	});

	it("renders Instructions and About as crawlable <a href> links across desktop and mobile breakpoints while preserving modifier clicks", () => {
		mockDialogState.lang = "de";
		mockDialogState.search = "?platform=corvette";

		const { unmount } = renderComponent(false);
		const desktopInstructions = screen.getByRole("link", { name: "buttons.instructions" });
		const desktopAbout = screen.getByRole("link", { name: "buttons.about" });

		expect(desktopInstructions.tagName).toBe("A");
		expect(desktopInstructions).toHaveAttribute("href", "/de/instructions/?platform=corvette");
		expect(desktopAbout.tagName).toBe("A");
		expect(desktopAbout).toHaveAttribute("href", "/de/about/?platform=corvette");

		// Modifier and middle clicks preserve native browser behavior
		expect(fireEvent.click(desktopInstructions, { button: 0, ctrlKey: true })).toBe(true);
		expect(fireEvent.click(desktopAbout, { button: 1 })).toBe(true);
		expect(openDialogMock).not.toHaveBeenCalled();

		// Unmodified primary left-click intercepts for SPA modal navigation
		expect(fireEvent.click(desktopAbout, { button: 0 })).toBe(false);
		expect(openDialogMock).toHaveBeenCalledWith("about");

		unmount();

		// Mobile (<640px) IconButton asChild branch
		vi.mocked(useBreakpoint).mockReturnValue(false);
		renderComponent(false);
		const mobileInstructions = screen.getByRole("link", { name: "buttons.instructions" });
		const mobileAbout = screen.getByRole("link", { name: "buttons.about" });

		expect(mobileInstructions.tagName).toBe("A");
		expect(mobileInstructions).toHaveAttribute("href", "/de/instructions/?platform=corvette");
		expect(mobileAbout.tagName).toBe("A");
		expect(mobileAbout).toHaveAttribute("href", "/de/about/?platform=corvette");
	});

	it("calls handleShowInstructions on instructions button click", () => {
		renderComponent(false);
		fireEvent.click(screen.getByLabelText("buttons.instructions"));

		expect(openDialogMock).toHaveBeenCalledWith("instructions");
		expect(markTutorialFinishedMock).toHaveBeenCalled();
	});

	it("calls handleShowAboutPage on about button click", () => {
		renderComponent(false);
		fireEvent.click(screen.getByLabelText("buttons.about"));

		expect(openDialogMock).toHaveBeenCalledWith("about");
	});

	it("calls handleShareClick and tracks GA event on share button click", () => {
		const getShareUrlSpy = vi
			.spyOn(sessionCoordinator, "getShareUrl")
			.mockReturnValue("http://share.url");
		renderComponent(false);
		fireEvent.click(screen.getByLabelText("buttons.share"));

		expect(getShareUrlSpy).toHaveBeenCalled();
		expect(openDialogMock).toHaveBeenCalledWith(null, { shareUrl: "http://share.url" });
		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "share",
			category: "ui",
			method: "url",
			nonInteraction: false,
			platform: "standard",
			value: 1,
		});
		getShareUrlSpy.mockRestore();
	});

	it("calls reset grid and related functions on reset button click", () => {
		renderComponent(false);
		fireEvent.click(screen.getByText("Reset Grid Button"));

		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "reset_grid",
			category: "ui",
			nonInteraction: false,
			platform: "standard",
			value: 1,
		});

		// Check that the functions inside handleResetGrid are called
		expect(mockResetGrid).toHaveBeenCalled();
		expect(mockSetIsSharedGrid).not.toHaveBeenCalled();
	});

	it("triggers instructions action handler when clicking its child SVG icon", () => {
		renderComponent(false);
		const button = screen.getByLabelText("buttons.instructions");
		const svg = button.querySelector("svg");
		expect(svg).toBeInTheDocument();
		fireEvent.click(svg!);

		expect(openDialogMock).toHaveBeenCalledWith("instructions");
		expect(markTutorialFinishedMock).toHaveBeenCalled();
	});

	it("triggers reset grid action handler when clicking its child SVG icon", () => {
		renderComponent(false);
		const button = screen.getByText("Reset Grid Button").closest("button");
		const svg = button?.querySelector("svg");
		expect(svg).toBeInTheDocument();
		fireEvent.click(svg!);

		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "reset_grid",
			category: "ui",
			nonInteraction: false,
			platform: "standard",
			value: 1,
		});
		expect(mockResetGrid).toHaveBeenCalled();
		expect(mockSetIsSharedGrid).not.toHaveBeenCalled();
	});

	it("initiates reset transition immediately and delegates scrolling asynchronously on mobile", () => {
		// Mock mobile breakpoint (< 1024px and < 640px)
		vi.mocked(useBreakpoint).mockImplementation((_bp: string) => false);

		const rafCallbacks: Array<FrameRequestCallback> = [];
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
			rafCallbacks.push(cb);

			return rafCallbacks.length;
		});
		const scrollToMock = vi.fn();
		Object.defineProperty(window, "scrollTo", {
			configurable: true,
			value: scrollToMock,
			writable: true,
		});

		const mockElement = document.createElement("div");
		const getBoundingClientRectMock = vi.fn().mockReturnValue({
			bottom: 250,
			height: 100,
			left: 0,
			right: 100,
			toJSON: () => {},
			top: 150,
			width: 100,
			x: 0,
			y: 150,
		});
		mockElement.getBoundingClientRect = getBoundingClientRectMock;

		// Set the shared grid container ref
		const { result: scrollHook } = renderHook(() => useScrollGridIntoView());
		scrollHook.current.gridContainerRef.current = mockElement;

		renderComponent(false);
		const resetButton = screen.getByLabelText("Reset Grid Button");
		fireEvent.click(resetButton);

		// 1. Reset state transitions must be initiated immediately
		expect(mockResetGrid).toHaveBeenCalled();
		expect(mockSetIsSharedGrid).not.toHaveBeenCalled();

		// 2. Synchronous layout measurement and scrolling must NOT occur in the click tick
		expect(getBoundingClientRectMock).not.toHaveBeenCalled();
		expect(scrollToMock).not.toHaveBeenCalled();

		// 3. Animation frame is scheduled
		expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

		// Step 2: Flush pre-paint frame
		act(() => {
			rafCallbacks.shift()?.(performance.now());
		});
		expect(getBoundingClientRectMock).not.toHaveBeenCalled();
		expect(scrollToMock).not.toHaveBeenCalled();

		// Step 3: Flush post-paint frame
		act(() => {
			rafCallbacks.shift()?.(performance.now());
		});
		expect(getBoundingClientRectMock).toHaveBeenCalledTimes(1);
		expect(scrollToMock).toHaveBeenCalledTimes(1);
	});
});
