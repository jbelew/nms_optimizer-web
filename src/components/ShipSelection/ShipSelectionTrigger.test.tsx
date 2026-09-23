import type { ShipSelectionContextValue } from "./useShipSelectionContext";
import React from "react";
import { DropdownMenu } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShipSelectionTrigger } from "./ShipSelectionTrigger";
import { ShipSelectionContext } from "./useShipSelectionContext";

const mockT = vi.fn((key: string) => {
	if (key === "shipSelection.ariaLabel") return "Select ship type";

	return key;
});

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: mockT,
	}),
}));

const defaultContextValue: ShipSelectionContextValue = {
	disabled: false,
	groupedShipTypes: {},
	handleOptionSelect: vi.fn(),
	isPending: false,
	selectedShipType: "fighter",
};

/**
 * Helper to render the ShipSelectionTrigger within Radix Dropdown and context provider.
 *
 * @param {Partial<ShipSelectionContextValue>} contextOverrides - Context values to override in tests.
 * @returns {ReturnType<typeof render>} Render result from React Testing Library.
 */
interface TestWrapperProps {
	children: React.ReactNode;
	contextOverrides?: Partial<ShipSelectionContextValue>;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children, contextOverrides }) => {
	const contextValue = React.useMemo<ShipSelectionContextValue>(
		() => ({
			...defaultContextValue,
			...contextOverrides,
		}),
		[contextOverrides]
	);

	return (
		<ShipSelectionContext.Provider value={contextValue}>
			<DropdownMenu.Root>{children}</DropdownMenu.Root>
		</ShipSelectionContext.Provider>
	);
};

const renderTrigger = (contextOverrides: Partial<ShipSelectionContextValue> = {}) => {
	return render(
		<TestWrapper contextOverrides={contextOverrides}>
			<ShipSelectionTrigger />
		</TestWrapper>
	);
};

describe("ShipSelectionTrigger", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders with the localized accessible name from shipSelection.ariaLabel", () => {
		renderTrigger();
		const triggerButton = screen.getByRole("button", { name: "Select ship type" });
		expect(triggerButton).toBeInTheDocument();
		expect(mockT).toHaveBeenCalledWith("shipSelection.ariaLabel");
	});

	it("disables trigger when context disabled or isPending is true", () => {
		renderTrigger({ disabled: true });
		expect(screen.getByRole("button", { name: "Select ship type" })).toBeDisabled();
	});
});
