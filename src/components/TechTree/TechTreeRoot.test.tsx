import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import * as useBreakpointModule from "@/hooks/useBreakpoint/useBreakpoint";
import { usePlatformStore } from "@/store/app/platformStore";

import { TechTreeRoot } from "./TechTreeRoot";

// Mock @radix-ui/themes
vi.mock("@radix-ui/themes", () => ({
	Box: ({
		children,
		className,
		style,
	}: {
		children?: React.ReactNode;
		className?: string;
		style?: React.CSSProperties;
	}) => (
		<div className={className} data-testid="box" style={style}>
			{children}
		</div>
	),
	ScrollArea: React.forwardRef<
		HTMLDivElement,
		{
			children?: React.ReactNode;
			className?: string;
			style?: React.CSSProperties;
		}
	>(({ children, className, style }, ref) => (
		<div className={className} data-testid="scroll-area" ref={ref} style={style}>
			{children}
		</div>
	)),
}));

// Mock hooks
vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => true),
}));

// Mock platform store
vi.mock("@/store/app/platformStore", () => ({
	usePlatformStore: vi.fn(),
}));

describe("TechTreeRoot", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useBreakpointModule.useBreakpoint).mockReturnValue(true);
		vi.mocked(usePlatformStore).mockImplementation((selector) =>
			selector({ selectedPlatform: "standard" } as never)
		);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test("should render ScrollArea on large screens", () => {
		render(
			<TechTreeRoot>
				<div data-testid="child">Child Content</div>
			</TechTreeRoot>
		);

		expect(screen.getByTestId("scroll-area")).toBeInTheDocument();
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	test("should render Box on small screens without ScrollArea", () => {
		vi.mocked(useBreakpointModule.useBreakpoint).mockReturnValue(false);

		render(
			<TechTreeRoot>
				<div data-testid="child">Child Content</div>
			</TechTreeRoot>
		);

		expect(screen.queryByTestId("scroll-area")).not.toBeInTheDocument();
		expect(screen.getByTestId("box")).toBeInTheDocument();
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	test("should scroll ScrollArea to top when selectedPlatform changes on desktop", () => {
		const scrollToSpy = vi.fn();
		HTMLElement.prototype.scrollTo = scrollToSpy;

		let currentPlatform = "standard";
		vi.mocked(usePlatformStore).mockImplementation((selector) =>
			selector({ selectedPlatform: currentPlatform } as never)
		);

		const { rerender } = render(
			<TechTreeRoot>
				<div data-testid="child">Child Content</div>
			</TechTreeRoot>
		);

		const scrollArea = screen.getByTestId("scroll-area");
		scrollArea.scrollTop = 250;

		// Initial render should not reset scroll
		expect(scrollToSpy).not.toHaveBeenCalled();

		// Change ship selection
		currentPlatform = "corvette";
		rerender(
			<TechTreeRoot>
				<div data-testid="child">Child Content</div>
			</TechTreeRoot>
		);

		expect(scrollToSpy).toHaveBeenCalledWith({ top: 0 });
		expect(scrollArea.scrollTop).toBe(0);
	});

	test("should not attempt to scroll when selectedPlatform changes on mobile", () => {
		vi.mocked(useBreakpointModule.useBreakpoint).mockReturnValue(false);
		const scrollToSpy = vi.fn();
		HTMLElement.prototype.scrollTo = scrollToSpy;

		let currentPlatform = "standard";
		vi.mocked(usePlatformStore).mockImplementation((selector) =>
			selector({ selectedPlatform: currentPlatform } as never)
		);

		const { rerender } = render(
			<TechTreeRoot>
				<div data-testid="child">Child Content</div>
			</TechTreeRoot>
		);

		currentPlatform = "freighter";
		rerender(
			<TechTreeRoot>
				<div data-testid="child">Child Content</div>
			</TechTreeRoot>
		);

		expect(scrollToSpy).not.toHaveBeenCalled();
	});
});
