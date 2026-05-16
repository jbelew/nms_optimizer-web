import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { isTouchDevice } from "@/utils/browser/environment";
import { useTooltipActions } from "@/utils/system/tooltipUtils";

import { ConditionalTooltip } from "./ConditionalTooltip";

// Mock isTouchDevice
vi.mock("../../utils/browser/environment", () => ({
	isTouchDevice: vi.fn(() => false),
}));

// Mock useTooltip hook
vi.mock("../../utils/system/tooltipUtils", () => ({
	useTooltipActions: vi.fn(),
	useTooltipState: vi.fn(),
}));

describe("ConditionalTooltip", () => {
	const mockShow = vi.fn();
	const mockHide = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(isTouchDevice).mockReturnValue(false);
		vi.mocked(useTooltipActions).mockReturnValue({
			hide: mockHide,
			show: mockShow,
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

	it("should call hide on click", () => {
		render(
			<ConditionalTooltip label="Test Label">
				<button>Click me</button>
			</ConditionalTooltip>
		);

		const trigger = screen.getByText("Click me");
		fireEvent.click(trigger);

		expect(mockHide).toHaveBeenCalled();
	});

	it("should call child's original onClick handler", () => {
		const originalOnClick = vi.fn();
		render(
			<ConditionalTooltip label="Test Label">
				<button onClick={originalOnClick}>Click me</button>
			</ConditionalTooltip>
		);

		const trigger = screen.getByText("Click me");
		fireEvent.click(trigger);

		expect(mockHide).toHaveBeenCalled();
		expect(originalOnClick).toHaveBeenCalled();
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
			<ConditionalTooltip delayDuration={1234} label="Test Label">
				<button>Custom delay</button>
			</ConditionalTooltip>
		);

		const trigger = screen.getByText("Custom delay");
		fireEvent.pointerEnter(trigger);

		expect(mockShow).toHaveBeenCalledWith("Test Label", expect.anything(), 1234);
	});
});
