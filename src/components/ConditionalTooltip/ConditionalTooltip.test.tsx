import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTooltipActions } from "../../context/TooltipContext";
import { isTouchDevice } from "../../utils/isTouchDevice";
import { ConditionalTooltip } from "./ConditionalTooltip";

// Mock isTouchDevice
vi.mock("../../utils/isTouchDevice", () => ({
	isTouchDevice: vi.fn(() => false),
}));

// Mock useTooltip hook
vi.mock("../../context/TooltipContext", () => ({
	useTooltipActions: vi.fn(),
	useTooltipState: vi.fn(),
	TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("ConditionalTooltip", () => {
	const mockShow = vi.fn();
	const mockHide = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(isTouchDevice).mockReturnValue(false);
		vi.mocked(useTooltipActions).mockReturnValue({
			show: mockShow,
			hide: mockHide,
		});
	});

	it("should call show on pointer enter", () => {
		render(
			<ConditionalTooltip label="Test Label">
				<button>Hover me</button>
			</ConditionalTooltip>
		);

		const trigger = screen.getByText("Hover me");
		fireEvent.pointerEnter(trigger);

		expect(mockShow).toHaveBeenCalledWith("Test Label", expect.anything(), 500);
	});

	it("should call hide on pointer leave", () => {
		render(
			<ConditionalTooltip label="Test Label">
				<button>Leave me</button>
			</ConditionalTooltip>
		);

		const trigger = screen.getByText("Leave me");
		fireEvent.pointerEnter(trigger);
		fireEvent.pointerLeave(trigger);

		expect(mockHide).toHaveBeenCalled();
	});

	it("should not call show on touch devices", () => {
		vi.mocked(isTouchDevice).mockReturnValue(true);

		render(
			<ConditionalTooltip label="Test Label">
				<button>Touch me</button>
			</ConditionalTooltip>
		);

		const trigger = screen.getByText("Touch me");
		fireEvent.pointerEnter(trigger);

		expect(mockShow).not.toHaveBeenCalled();
	});

	it("should pass custom delayDuration", () => {
		render(
			<ConditionalTooltip label="Test Label" delayDuration={1234}>
				<button>Custom delay</button>
			</ConditionalTooltip>
		);

		const trigger = screen.getByText("Custom delay");
		fireEvent.pointerEnter(trigger);

		expect(mockShow).toHaveBeenCalledWith("Test Label", expect.anything(), 1234);
	});
});
