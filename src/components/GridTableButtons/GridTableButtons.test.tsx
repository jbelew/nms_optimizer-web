import { render, screen, fireEvent } from "@testing-library/react";
import ReactGA from "react-ga4";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useDialog } from "../../context/dialog-utils";
import { useGridStore } from "../../store/GridStore";
import GridTableButtons from "./GridTableButtons";

// Mock external modules and hooks
vi.mock("react-ga4");
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key, // Mock t function to return the key
	}),
}));
vi.mock("../../hooks/useBreakpoint");
vi.mock("../../context/dialog-utils");

// Define a type for the mock state of useGridStore
interface MockGridStoreState {
	isSharedGrid: boolean;
	hasModulesInGrid: boolean;
	setIsSharedGrid: (value: boolean) => void;
}

// Define a type for the mocked useGridStore function
interface MockUseGridStore {
	_setMockState: (isShared: boolean, hasModules: boolean) => void;
}

// Mock useGridStore and selectHasModulesInGrid
vi.mock("../../store/GridStore", () => {
	const mockSetIsSharedGrid = vi.fn();
	let mockIsSharedGrid = false;
	let mockHasModulesInGrid = true;

	const mockUseGridStore = ((selector?: (state: MockGridStoreState) => unknown) => {
		const mockState: MockGridStoreState = {
			isSharedGrid: mockIsSharedGrid,
			hasModulesInGrid: mockHasModulesInGrid,
			setIsSharedGrid: mockSetIsSharedGrid,
		};

		if (typeof selector === "function") {
			return selector(mockState); // Removed as any cast
		}
		return mockState;
	}) as unknown as MockUseGridStore; // Assert the type here

	// This is a helper to update the internal state of the mock
	mockUseGridStore._setMockState = (isShared: boolean, hasModules: boolean) => {
		mockIsSharedGrid = isShared;
		mockHasModulesInGrid = hasModules;
	};

	return {
		useGridStore: mockUseGridStore,
		// Mock selectHasModulesInGrid to return the value from our internal mock state
		selectHasModulesInGrid: () => mockHasModulesInGrid,
		// Export the mockSetIsSharedGrid so tests can assert on it
		setIsSharedGrid: mockSetIsSharedGrid,
	};
});

describe("GridTableButtons", () => {
	const mockResetGridAction = vi.fn();
	const mockUpdateUrlForShare = vi.fn(() => "http://share.url");
	const mockUpdateUrlForReset = vi.fn();
	// Get the mocked setIsSharedGrid from the mocked module (which is a vi.fn() mock)
	const { setIsSharedGrid } = useGridStore() as unknown as {
		setIsSharedGrid: (value: boolean) => void;
	};

	const defaultProps = {
		solving: false,
		resetGridAction: mockResetGridAction,
		updateUrlForShare: mockUpdateUrlForShare,
		updateUrlForReset: mockUpdateUrlForReset,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(useBreakpoint as Mock).mockReturnValue(true); // Default to smallAndUp
		(useDialog as Mock).mockReturnValue({
			openDialog: vi.fn(),
			isFirstVisit: false,
			onFirstVisitInstructionsDialogOpened: vi.fn(),
		});

		// Reset the internal mock state for useGridStore before each test
		(useGridStore as unknown as MockUseGridStore)._setMockState(false, true); // Default to not shared, has modules
	});

	it("renders all buttons when not shared grid and has modules", () => {
		render(<GridTableButtons {...defaultProps} />);
		expect(screen.getByLabelText("buttons.instructions")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.about")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.share")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.resetGrid")).toBeInTheDocument();
	});

	it("does not render share button when isSharedGrid is true", () => {
		(useGridStore as unknown as MockUseGridStore)._setMockState(true, true); // Set shared grid to true
		render(<GridTableButtons {...defaultProps} />);
		expect(screen.queryByLabelText("buttons.share")).not.toBeInTheDocument();
	});

	it("disables share button when solving is true", () => {
		render(<GridTableButtons {...defaultProps} solving={true} />);
		expect(screen.getByLabelText("buttons.share")).toBeDisabled();
	});

	it("disables share button when hasModulesInGrid is false", () => {
		(useGridStore as unknown as MockUseGridStore)._setMockState(false, false); // Set hasModulesInGrid to false
		render(<GridTableButtons {...defaultProps} />);
		expect(screen.getByLabelText("buttons.share")).toBeDisabled();
	});

	it("disables reset button when solving is true", () => {
		render(<GridTableButtons {...defaultProps} solving={true} />);
		expect(screen.getByLabelText("buttons.resetGrid")).toBeDisabled();
	});

	it("calls handleShowInstructions and tracks GA event on instructions button click", () => {
		const { openDialog, onFirstVisitInstructionsDialogOpened } = useDialog();
		(useDialog as Mock).mockReturnValue({
			openDialog,
			isFirstVisit: true,
			onFirstVisitInstructionsDialogOpened,
		});

		render(<GridTableButtons {...defaultProps} />);
		fireEvent.click(screen.getByLabelText("buttons.instructions"));

		expect(openDialog).toHaveBeenCalledWith("instructions");
		expect(onFirstVisitInstructionsDialogOpened).toHaveBeenCalled();
		expect(ReactGA.event).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "showInstructions",
		});
	});

	it("calls handleShowAboutPage and tracks GA event on about button click", () => {
		const { openDialog } = useDialog();
		render(<GridTableButtons {...defaultProps} />);
		fireEvent.click(screen.getByLabelText("buttons.about"));

		expect(openDialog).toHaveBeenCalledWith("about");
		expect(ReactGA.event).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "showAbout",
		});
	});

	it("calls handleShareClick and tracks GA event on share button click", () => {
		const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(null);
		render(<GridTableButtons {...defaultProps} />);
		fireEvent.click(screen.getByLabelText("buttons.share"));

		expect(mockUpdateUrlForShare).toHaveBeenCalled();
		expect(windowOpenSpy).toHaveBeenCalledWith("http://share.url", "_blank", "noopener,noreferrer");
		expect(ReactGA.event).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "shareLink",
		});
		windowOpenSpy.mockRestore();
	});

	it("calls handleResetGrid and tracks GA event on reset button click", () => {
		render(<GridTableButtons {...defaultProps} />);
		fireEvent.click(screen.getByLabelText("buttons.resetGrid"));

		expect(mockResetGridAction).toHaveBeenCalled();
		expect(mockUpdateUrlForReset).toHaveBeenCalled();
		expect(setIsSharedGrid).toHaveBeenCalledWith(false);
		expect(ReactGA.event).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "resetGrid",
		});
	});
});
