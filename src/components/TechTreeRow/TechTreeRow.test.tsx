import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { TechTreeRow, type TechTreeRowProps } from "./TechTreeRow"; // Import TechTreeRowProps from here
import { useGridStore } from "../../store/GridStore";
import { useTechStore } from "../../store/TechStore";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { type TechState } from "../../store/TechStore"; // Assumed correct state type name
import { useShakeStore } from "../../store/ShakeStore";

// Import the actual GridStore type
import { type GridStore } from "../../store/GridStore";

// Mock stores
vi.mock("../../store/GridStore");
vi.mock("../../store/TechStore");
vi.mock("../../store/ShakeStore");

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { defaultValue?: string; tech?: string }) => {
			if (key.startsWith("technologies.")) {
				const parts = key.split(".");
				// Expecting format: technologies.shipType.techKey
				if (parts.length === 3) {
					return `${parts[1]}.${parts[2]}`;
				}
				// Handle "technologies.hyperdrive" directly for the label test
				if (key === "technologies.hyperdrive") {
					return "standard.hyperdrive";
				}
				return key; // Fallback for unexpected format
			}
			if (key.startsWith("modules.")) {
				const parts = key.split(".");
				// Expecting format: modules.moduleId
				if (parts.length === 2) {
					return parts[1];
				}
				return key; // Fallback for unexpected format
			}
			if (key === "techTree.tooltips.solve" && options?.tech) {
				return `techTree.tooltips.solve ${options.tech}`;
			}
			// For other keys, return the key itself or defaultValue if provided
			return options?.defaultValue || key;
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
		), // NOSONAR
		Trigger: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
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

		// Mock useGridStore implementation to handle selectors
		vi.mocked(useGridStore).mockImplementation((selector?: (state: GridStore) => unknown) => {
			const mockState = {
				hasTechInGrid: mockHasTechInGrid,
				isGridFull: mockIsGridFull,
				resetGridTech: mockResetGridTech,
				// Add other GridStore properties if they are accessed by the component under test
			} as unknown as GridStore; // Cast to GridStore
			return selector ? selector(mockState) : mockState;
		});

		// Mock useTechStore implementation to handle selectors
		vi.mocked(useTechStore).mockImplementation((selector?: (state: TechState) => unknown) => {
			const mockState: TechState = {
				max_bonus: {},
				clearTechMaxBonus: mockClearTechMaxBonus,
				solved_bonus: {},
				clearTechSolvedBonus: mockClearTechSolvedBonus,
				checkedModules: {},
				setCheckedModules: vi.fn(),
				clearCheckedModules: vi.fn(),
				getTechColor: mockGetTechColorImplementation,
				// Ensure all properties of TechStoreState are present, or cast if it's a partial mock:
			} as unknown as TechState; // Cast if mockState is a partial representation
			if (selector) {
				return selector(mockState);
			}
			return mockState; // This is what TechTreeRow receives as it calls useTechStore() without a selector
		});

		vi.mocked(useShakeStore).mockReturnValue({
			setShaking: mockSetShaking,
		});
	});

	const defaultProps: TechTreeRowProps = {
		tech: "hyper",
		handleOptimize: mockHandleOptimize,
		solving: false,
		techImage: "hyperdrive.webp",
		isGridFull: mockIsGridFull(),
		hasRewardModules: false,
		rewardModules: [],
		selectedShipType: "standard", // Add selectedShipType
		moduleCount: 5, // Add moduleCount
		techColor: "red", // Add techColor
	};

	test("renders the label and optimize button with initial icon", () => {
		render(
			<RadixTooltip.Provider>
				<TechTreeRow {...defaultProps} />
			</RadixTooltip.Provider>
		);

		// The label is now constructed from selectedShipType and the transformed techImage by the mock
		const expectedLabel = `${defaultProps.selectedShipType}.${
			defaultProps.techImage ? defaultProps.techImage.replace(/\.\w+$/, "") : defaultProps.tech
		}`;
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

		const expectedLabel = `${defaultProps.selectedShipType}.${
			defaultProps.techImage ? defaultProps.techImage.replace(/\.\w+$/, "") : defaultProps.tech
		}`;
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
