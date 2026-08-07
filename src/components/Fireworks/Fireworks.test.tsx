import React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Fireworks } from "./Fireworks";

describe("Fireworks component", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Set default system time to August 9, 2026 (NMS 10th Anniversary)
		vi.setSystemTime(new Date("2026-08-09T12:00:00Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("renders the fireworks container with correct aria-hidden attribute", () => {
		const { container } = render(<Fireworks />);
		const fireworksContainer = container.querySelector(".fireworks-container");

		expect(fireworksContainer).toBeInTheDocument();
		expect(fireworksContainer).toHaveAttribute("aria-hidden", "true");
	});

	test("renders 8 individual firework elements", () => {
		const { container } = render(<Fireworks />);
		const fireworks = container.querySelectorAll(".firework");

		expect(fireworks).toHaveLength(8);
	});

	test("renders 16 particles within each firework", () => {
		const { container } = render(<Fireworks />);
		const fireworks = container.querySelectorAll(".firework");

		fireworks.forEach((firework) => {
			const particles = firework.querySelectorAll(".particle");
			expect(particles).toHaveLength(16);
		});
	});

	test("does not render outside the anniversary date range", () => {
		// August 6, 2026 - too early
		vi.setSystemTime(new Date("2026-08-06T23:59:59Z"));
		const { container: containerBefore } = render(<Fireworks />);
		expect(containerBefore.firstChild).toBeNull();

		// August 13, 2026 - too late
		vi.setSystemTime(new Date("2026-08-13T00:00:00Z"));
		const { container: containerAfter } = render(<Fireworks />);
		expect(containerAfter.firstChild).toBeNull();

		// August 9, 2027 - should still render in another year
		vi.setSystemTime(new Date("2027-08-09T12:00:00Z"));
		const { container: containerNextYear } = render(<Fireworks />);
		expect(containerNextYear.querySelector(".fireworks-container")).toBeInTheDocument();
	});

	test("renders on the boundary dates of the range", () => {
		// August 7, 2026 - start date
		vi.setSystemTime(new Date("2026-08-07T00:00:00Z"));
		const { container: containerStart } = render(<Fireworks />);
		expect(containerStart.querySelector(".fireworks-container")).toBeInTheDocument();

		// August 12, 2026 - end date
		vi.setSystemTime(new Date("2026-08-12T23:59:59Z"));
		const { container: containerEnd } = render(<Fireworks />);
		expect(containerEnd.querySelector(".fireworks-container")).toBeInTheDocument();
	});

	test("advances animation cycles via timers", () => {
		const { container } = render(<Fireworks />);
		expect(container.querySelectorAll(".particle")).toHaveLength(128); // 8 fireworks * 16 particles

		// Advance timers to trigger the first set of cycle updates
		act(() => {
			vi.advanceTimersByTime(10000);
		});

		// Particles should still be rendered (re-created for new cycles)
		expect(container.querySelectorAll(".particle")).toHaveLength(128);
	});
});
