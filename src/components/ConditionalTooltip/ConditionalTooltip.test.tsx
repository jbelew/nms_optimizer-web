import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { isTouchDevice } from "../../utils/isTouchDevice";
import { ConditionalTooltip } from "./ConditionalTooltip";

// Mock isTouchDevice
vi.mock("../../utils/isTouchDevice", () => ({
	isTouchDevice: vi.fn(() => false),
}));

// Mock Radix Tooltip
vi.mock("@radix-ui/themes", () => ({
	Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
		<div data-testid="radix-tooltip" title={content}>
			{children}
		</div>
	),
}));

describe("ConditionalTooltip", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should not render Radix Tooltip by default", () => {
		render(
			<ConditionalTooltip label="Test Label">
				<button>Hover me</button>
			</ConditionalTooltip>
		);

		expect(screen.queryByTestId("radix-tooltip")).not.toBeInTheDocument();
		expect(screen.getByText("Hover me")).toBeInTheDocument();
	});

	it("should render Radix Tooltip on pointer enter", () => {
		render(
			<ConditionalTooltip label="Test Label">
				<button>Hover me</button>
			</ConditionalTooltip>
		);

		const trigger = screen.getByText("Hover me");
		fireEvent.pointerEnter(trigger);

		expect(screen.getByTestId("radix-tooltip")).toBeInTheDocument();
		expect(screen.getByTestId("radix-tooltip")).toHaveAttribute("title", "Test Label");
	});

	it("should remove Radix Tooltip on pointer leave", () => {
		render(
			<ConditionalTooltip label="Test Label">
				<button>Hover me</button>
			</ConditionalTooltip>
		);

		const trigger = screen.getByText("Hover me");
		fireEvent.pointerEnter(trigger);
		expect(screen.getByTestId("radix-tooltip")).toBeInTheDocument();

		// Re-query the trigger as it might have been cloned/replaced during re-render
		const activeTrigger = screen.getByText("Hover me");
		fireEvent.pointerLeave(activeTrigger);
		expect(screen.queryByTestId("radix-tooltip")).not.toBeInTheDocument();
	});

	it("should not render tooltip on touch devices even when hovered", () => {
		// Reset mock for this specific test
		vi.mocked(isTouchDevice).mockReturnValue(true);

		render(
			<ConditionalTooltip label="Test Label">
				<button>Hover me</button>
			</ConditionalTooltip>
		);

		expect(screen.getByText("Hover me")).toBeInTheDocument();
		fireEvent.pointerEnter(screen.getByText("Hover me"));
		expect(screen.queryByTestId("radix-tooltip")).not.toBeInTheDocument();
	});
});
