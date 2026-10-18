import React from "react";
import { Theme } from "@radix-ui/themes";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { FLAVOR_MESSAGE_DELAY_MS, MessageSpinner } from "./MessageSpinner";

vi.mock("react-i18next", () => {
	const mockRandomMessages = ["-(( Asking the Atlas for guidance! ))-"];

	const mockT = (key: string, options?: { returnObjects?: boolean }) => {
		if (key === "messageSpinner.randomMessages" && options?.returnObjects) {
			return mockRandomMessages;
		}

		return key;
	};

	return {
		useTranslation: () => ({
			t: mockT,
		}),
	};
});

/**
 * Helper to render component within Radix Theme context.
 */
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<Theme>{ui}</Theme>);
};

describe("MessageSpinner", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("should render nothing when isVisible is false", () => {
		renderWithTheme(<MessageSpinner isVisible={false} />);
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	test("should render spinner and message when showProgress is false", () => {
		const { container } = renderWithTheme(
			<MessageSpinner
				initialMessage="LOADING TECH"
				isVisible={true}
			/>,
		);

		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByText("LOADING TECH")).toBeInTheDocument();
		expect(container.querySelector(".MessageSpinner__spinner")).toBeInTheDocument();
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	test("should hide spinner and render progress bar with delayed flavor message when showProgress is true", async () => {
		const { container } = renderWithTheme(
			<MessageSpinner
				initialMessage="Optimizing!"
				isVisible={true}
				progressPercent={45}
				showProgress={true}
			/>,
		);

		expect(screen.getByRole("status")).toBeInTheDocument();
		expect(screen.getByText("Optimizing!")).toBeInTheDocument();
		expect(container.querySelector(".MessageSpinner__spinner")).not.toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toBeInTheDocument();

		// Flavor message should not be visible before the delay
		expect(
			screen.queryByText("-(( Asking the Atlas for guidance! ))-"),
		).not.toBeInTheDocument();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(FLAVOR_MESSAGE_DELAY_MS);
		});

		const flavorText = screen.getByText("-(( Asking the Atlas for guidance! ))-");
		expect(flavorText).toBeInTheDocument();
		expect(flavorText).toHaveClass("MessageSpinner__random--visible");
	});
});
