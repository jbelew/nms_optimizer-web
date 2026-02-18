import React from "react";
import { Theme } from "@radix-ui/themes";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Logger, LogLevel } from "../../utils/logger";
import ObservabilityDashboard from "./ObservabilityDashboard";

// Mock Logger
vi.mock("../../utils/logger", () => ({
	Logger: {
		getLogs: vi.fn(),
		clearLogs: vi.fn(),
	},
	LogLevel: {
		INFO: "INFO",
		WARN: "WARN",
		ERROR: "ERROR",
	},
}));

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<Theme>{ui}</Theme>);
};

describe("ObservabilityDashboard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should render empty state when no logs are present", () => {
		vi.mocked(Logger.getLogs).mockReturnValue([]);
		renderWithTheme(<ObservabilityDashboard />);
		expect(screen.getByText("No logs captured yet.")).toBeInTheDocument();
	});

	it("should render logs when they exist", () => {
		const mockLogs = [
			{
				level: LogLevel.INFO,
				message: "Test info log",
				timestamp: Date.now(),
				data: { key: "value" },
			},
		];
		vi.mocked(Logger.getLogs).mockReturnValue(mockLogs);

		renderWithTheme(<ObservabilityDashboard />);

		expect(screen.getByText(/Test info log/)).toBeInTheDocument();
		expect(screen.getByText(/INFO/)).toBeInTheDocument();
	});

	it("should clear logs when button is clicked", () => {
		vi.mocked(Logger.getLogs).mockReturnValue([
			{ level: LogLevel.INFO, message: "log", timestamp: Date.now() },
		]);

		renderWithTheme(<ObservabilityDashboard />);
		const clearButton = screen.getByRole("button", { name: /Clear Logs/i });

		fireEvent.click(clearButton);

		expect(Logger.clearLogs).toHaveBeenCalled();
		expect(screen.getByText("No logs captured yet.")).toBeInTheDocument();
	});

	it("should poll for new logs", async () => {
		vi.mocked(Logger.getLogs).mockReturnValue([]);
		renderWithTheme(<ObservabilityDashboard />);

		expect(screen.getByText("No logs captured yet.")).toBeInTheDocument();

		// Add a log and fast-forward time
		vi.mocked(Logger.getLogs).mockReturnValue([
			{ level: LogLevel.INFO, message: "New log", timestamp: Date.now() },
		]);

		await act(async () => {
			vi.advanceTimersByTime(2001);
		});

		expect(screen.getByText(/New log/)).toBeInTheDocument();
	});
});
