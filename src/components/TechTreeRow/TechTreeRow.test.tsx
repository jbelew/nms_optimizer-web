import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi, type Mock } from "vitest";
import { TechTreeRow, type TechTreeRowProps } from "./TechTreeRow"; // Import TechTreeRowProps from here
import { useGridStore } from "../../store/GridStore";
import { useTechStore } from "../../store/TechStore";
import * as RadixTooltip from "@radix-ui/react-tooltip"; // Import for Tooltip.Provider
import { useShakeStore } from "../../store/ShakeStore";

// Mock stores
vi.mock("../../store/GridStore");
vi.mock("../../store/TechStore");
vi.mock("../../store/ShakeStore");

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => {
			if (key.startsWith("technologies.")) {
				// e.g., technologies.hyperdrive.webp -> hyperdrive.webp
				// or technologies.hyperdrive -> hyperdrive
				return key.substring("technologies.".length);
			}
			if (key.startsWith("modules.")) {
				return key.substring("modules.".length); // Returns image name, e.g., "module_image.webp"
			}
			return key; // Return the key itself for other translations
		},
	}),
}));

// Mock Radix UI components and icons to simplify testing
vi.mock("@radix-ui/react-icons", () => ({
	UpdateIcon: () => <svg data-testid="update-icon" />,
	ResetIcon: () => <svg data-testid="reset-icon" />,
	ChevronDownIcon: () => <svg data-testid="chevron-down-icon" />,
	DoubleArrowLeftIcon: () => <svg data-testid="double-arrow-left-icon" />,
	ExclamationTriangleIcon: () => <svg data-testid="exclamation-triangle-icon" />,
	Crosshair2Icon: () => <svg data-testid="crosshair2-icon" />,
	LightningBoltIcon: () => <svg data-testid="lightning-bolt-icon" />,
}));

vi.mock("radix-ui", () => ({
	Accordion: {
		Root: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="accordion-root">{children}</div>
		),
		Item: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="accordion-item">{children}</div>
		),
		Header: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="accordion-header">{children}</div>
		),
		Trigger: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
			<button {...props} data-testid="accordion-trigger">
				{children}
			</button>
		),
		Content: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="accordion-content">{children}</div>
		),
	},
}));

describe("TechTreeRow", () => {
	const mockHandleOptimize = vi.fn();
	const mockSetShaking = vi.fn();

	// Define the mock for the getTechColor function itself
	const mockGetTechColorImplementation = vi.fn().mockReturnValue("blue");

	// Define specific mocks for store actions to assert calls
	const mockResetGridTech = vi.fn();
	const mockClearTechMaxBonus = vi.fn();
	const mockClearTechSolvedBonus = vi.fn();
	const mockIsGridFull = vi.fn().mockReturnValue(false);
	const mockHasTechInGrid = vi.fn().mockReturnValue(false);

	beforeEach(() => {
		// Clear mocks before each test
		mockGetTechColorImplementation.mockClear().mockReturnValue("blue");
		mockHandleOptimize.mockClear();
		mockSetShaking.mockClear();
		mockResetGridTech.mockClear();
		mockClearTechMaxBonus.mockClear();
		mockClearTechSolvedBonus.mockClear();
		mockIsGridFull.mockClear().mockReturnValue(false);
		mockHasTechInGrid.mockClear().mockReturnValue(false);

		vi.mocked(useGridStore).mockImplementation((selector?: (state: any) => any) => {
			const mockState = {
				hasTechInGrid: mockHasTechInGrid,
				isGridFull: mockIsGridFull,
				resetGridTech: mockResetGridTech,
			};
			if (selector) {
				return selector(mockState);
			}
			return mockState;
		});

		// Mock useTechStore implementation to handle selectors
		vi.mocked(useTechStore).mockImplementation((selector?: (state: any) => any) => {
			const mockState = {
				max_bonus: {},
				clearTechMaxBonus: mockClearTechMaxBonus,
				solved_bonus: {},
				clearTechSolvedBonus: mockClearTechSolvedBonus,
				checkedModules: {},
				setCheckedModules: vi.fn(),
				clearCheckedModules: vi.fn(),
				getTechColor: mockGetTechColorImplementation,
			};
			if (selector) {
				return selector(mockState);
			}
			return mockState;
		});

		vi.mocked(useShakeStore).mockReturnValue({
			setShaking: mockSetShaking,
		});
	});

	const defaultProps: TechTreeRowProps = {
		tech: "hyperdrive",
		handleOptimize: mockHandleOptimize,
		solving: false,
		modules: [],
		techImage: "hyperdrive.webp",
	};

	test("renders the label and optimize button with initial icon", () => {
		render(
			<RadixTooltip.Provider>
				<TechTreeRow {...defaultProps} />
			</RadixTooltip.Provider>
		);

		// The label is now constructed from selectedShipType and tech by the mock
		// It will use techImage if available, otherwise tech id, based on the mock's transformation
		const expectedLabel = defaultProps.techImage ? defaultProps.techImage : defaultProps.tech;
		expect(screen.getByText(expectedLabel)).toBeInTheDocument();

		// The optimize button's aria-label is now based on mocked t() output
		const optimizeButton = screen.getByLabelText(`techTree.tooltips.solve ${expectedLabel}`);
		expect(optimizeButton).toBeInTheDocument();
		// Check for the correct initial icon (DoubleArrowLeftIcon)
		expect(screen.getByTestId("double-arrow-left-icon")).toBeInTheDocument();
	});

	test("calls handleOptimize and resets relevant states when optimize button is clicked (not solving, grid not full)", async () => {
		mockHasTechInGrid.mockReturnValue(false); // Ensure it's the "Solve" state
		mockIsGridFull.mockReturnValue(false); // Ensure grid is not full

		render(
			<RadixTooltip.Provider>
				<TechTreeRow {...defaultProps} solving={false} />
			</RadixTooltip.Provider>
		);

		const expectedLabel = defaultProps.techImage ? defaultProps.techImage : defaultProps.tech;
		const optimizeButton = screen.getByLabelText(`techTree.tooltips.solve ${expectedLabel}`);
		fireEvent.click(optimizeButton);

		// Check that store reset functions are called before handleOptimize
		expect(mockResetGridTech).toHaveBeenCalledWith(defaultProps.tech);
		expect(mockClearTechMaxBonus).toHaveBeenCalledWith(defaultProps.tech);
		expect(mockClearTechSolvedBonus).toHaveBeenCalledWith(defaultProps.tech);

		// Check that handleOptimize is called
		expect(mockHandleOptimize).toHaveBeenCalledWith(defaultProps.tech);
		expect(mockHandleOptimize).toHaveBeenCalledTimes(1);

		// Ensure shake is not triggered
		expect(mockSetShaking).not.toHaveBeenCalled();
	});
});
