/**
 * @file RouteError component unit tests.
 */

import { render, screen } from "@testing-library/react";
import { useRouteError } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { lifecycleCoordinator } from "@/utils/system/lifecycleCoordinator";

import * as errorHandler from "./errorHandler";
import { RouteError } from "./RouteError";

// Mock splash screen runtime
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

// Mock React Router hook
vi.mock("react-router-dom", () => ({
	useRouteError: vi.fn(),
}));

// Mock ErrorContent
vi.mock("./ErrorContent", () => ({
	ErrorContent: ({ error, variant }: { error?: Error; variant: string }) => (
		<div data-testid="error-content" data-variant={variant}>
			{error?.message}
		</div>
	),
}));

describe("RouteError component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call handleError, signal lifecycleCoordinator.markReady, and render ErrorContent", () => {
		const testError = new Error("Route loading failed");
		vi.mocked(useRouteError).mockReturnValue(testError);

		const handleErrorSpy = vi.spyOn(errorHandler, "handleError");
		const markReadySpy = vi.spyOn(lifecycleCoordinator, "markReady");

		render(<RouteError />);

		expect(handleErrorSpy).toHaveBeenCalledWith(testError);
		expect(markReadySpy).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId("error-content")).toHaveTextContent("Route loading failed");
		expect(screen.getByTestId("error-content")).toHaveAttribute("data-variant", "page");

		markReadySpy.mockRestore();
	});
});
