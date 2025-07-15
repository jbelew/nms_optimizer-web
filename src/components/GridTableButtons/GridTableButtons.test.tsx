import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useDialog } from "../../context/dialog-utils";
import { useGridStore } from "../../store/GridStore";
import GridTableButtons from "./GridTableButtons";
import { useAnalytics } from "../../hooks/useAnalytics";

// Mock external modules and hooks
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => {
			if (key === "buttons.resetGrid") {
				return "Reset Grid Button"; // A distinct name for the button's text content
			}
			return key; // For other keys, return the key itself
		},
	}),
}));
vi.mock("../../hooks/useBreakpoint");
vi.mock("../../context/dialog-utils");
vi.mock("../../hooks/useAnalytics");

let mockSendEvent: Mock;



// Define a type for the mocked useGridStore function
interface MockUseGridStore {
	_setMockState: (isShared: boolean, hasModules: boolean, initialGridDef?: unknown) => void;
	getState: () => ReturnType<typeof useGridStore.getState>;
}

// Mock useGridStore and selectHasModulesInGrid
vi.mock("../../store/GridStore", async () => {

	const mockSetIsSharedGrid = vi.fn();
	const mockApplyModulesToGrid = vi.fn();
	const mockSetGridFixed = vi.fn();
	const mockSetSuperchargedFixed = vi.fn();
	const mockResetGrid = vi.fn();
	const mockSetGridFromInitialDefinition = vi.fn();

	let mockIsSharedGrid = false;
	let mockHasModulesInGrid = true;
	let mockInitialGridDefinition: unknown = undefined;
	const mockGrid = { cells: [[]], width: 0, height: 0 }; // Initialize with a basic grid structure

	const mockStore = {
		isSharedGrid: mockIsSharedGrid,
		hasModulesInGrid: mockHasModulesInGrid,
		initialGridDefinition: mockInitialGridDefinition,
		grid: mockGrid, // Add the mock grid here
		setIsSharedGrid: mockSetIsSharedGrid,
		applyModulesToGrid: mockApplyModulesToGrid,
		setGridFixed: mockSetGridFixed,
		setSuperchargedFixed: mockSetSuperchargedFixed,
		resetGrid: mockResetGrid,
		setGridFromInitialDefinition: mockSetGridFromInitialDefinition,
		getState: vi.fn(() => mockStore),
		_setMockState: (isShared: boolean, hasModules: boolean, initialGridDef?: unknown) => {
			mockIsSharedGrid = isShared;
			mockHasModulesInGrid = hasModules;
			mockInitialGridDefinition = initialGridDef;
			mockStore.isSharedGrid = mockIsSharedGrid;
			mockStore.hasModulesInGrid = mockHasModulesInGrid;
			mockStore.initialGridDefinition = mockInitialGridDefinition;
			mockStore.grid = mockGrid; // Update the grid in the mock store
		},
	};

	const useGridStoreMock = vi.fn((selector?: (state: unknown) => unknown) => {
		if (typeof selector === "function") {
			return selector(mockStore);
		}
		return mockStore;
	});

	Object.assign(useGridStoreMock, mockStore);

	return {
		useGridStore: useGridStoreMock,
		selectHasModulesInGrid: () => mockStore.hasModulesInGrid,
	};
});

describe("GridTableButtons", () => {
	const mockResetGridAction = vi.fn();
	const mockUpdateUrlForShare = vi.fn(() => "http://share.url");
	const mockUpdateUrlForReset = vi.fn();
	// Get the mocked setIsSharedGrid from the mocked module (which is a vi.fn() mock)
	

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
		mockSendEvent = vi.fn();
		(useAnalytics as Mock).mockReturnValue({
			sendEvent: mockSendEvent,
		});

		// Reset the internal mock state for useGridStore before each test
		(useGridStore as unknown as MockUseGridStore)._setMockState(false, true); // Default to not shared, has modules
	});

	it("renders all buttons when not shared grid and has modules", () => {
		render(<GridTableButtons {...defaultProps} />);
		expect(screen.getByLabelText("buttons.instructions")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.about")).toBeInTheDocument();
		expect(screen.getByLabelText("buttons.share")).toBeInTheDocument();
		expect(screen.getByLabelText("Reset Grid Button")).toBeInTheDocument();
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
		expect(screen.getByLabelText("Reset Grid Button")).toBeDisabled();
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
		expect(mockSendEvent).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "showInstructions",
		});
	});

	it("calls handleShowAboutPage and tracks GA event on about button click", () => {
		const { openDialog } = useDialog();
		render(<GridTableButtons {...defaultProps} />);
		fireEvent.click(screen.getByLabelText("buttons.about"));

		expect(openDialog).toHaveBeenCalledWith("about");
		expect(mockSendEvent).toHaveBeenCalledWith({
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
		expect(mockSendEvent).toHaveBeenCalledWith({
			category: "User Interactions",
			action: "shareLink",
		});
		windowOpenSpy.mockRestore();
	});

	
});
