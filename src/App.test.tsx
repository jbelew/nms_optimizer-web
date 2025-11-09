import { lazy } from "react"; // Add this line
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Theme } from "@radix-ui/themes";
import { act, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

const ErrorContent = lazy(() => import("./components/AppDialog/ErrorContent"));
const ShareLinkDialog = lazy(() => import("./components/AppDialog/ShareLinkDialog"));
const NotFound = lazy(() => import("./components/NotFound/NotFound"));

import App from "./App";
import { DialogProvider } from "./context/DialogContext";
import { usePlatformStore } from "./store/PlatformStore";

// Mock the hideSplashScreen function
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

// Mock useFetchShipTypesSuspense to avoid actual data fetching
vi.mock("./hooks/useShipTypes/useShipTypes", () => ({
	useFetchShipTypesSuspense: vi.fn(() => ({
		standard: {
			label: "Standard",
			type: "ship",
			technologies: [], // Add technologies array
		},
	})),
}));

// Mock useTechTree to prevent network requests
vi.mock("./hooks/useTechTree/useTechTree", () => ({
	useTechTree: vi.fn(() => ({
		techTree: {
			standard: {
				name: "Standard",
				technologies: [], // Provide an empty array for technologies
			},
		},
		isLoading: false,
		error: null,
		fetchTechTree: vi.fn(),
	})),
	useFetchTechTreeSuspense: vi.fn(() => ({
		// Mock the return value of useFetchTechTreeSuspense
		// This should match the expected structure of the tech tree data
		standard: [
			{
				label: "Technology 1",
				key: "tech1",
				modules: [],
				image: null,
				color: "blue",
				module_count: 0,
			},
		],
		recommended_builds: [], // Add recommended_builds to satisfy the interface
	})),
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key, // Mock the t function to return the key
		i18n: {
			changeLanguage: vi.fn(),
			language: "en", // Mock the language property
			options: {
				supportedLngs: ["en", "es", "fr", "de", "pt"], // Mock supportedLngs
			},
			services: {
				resourceStore: {
					data: {}, // Mock resourceStore.data
				},
			},
		},
	}),
	initReactI18next: {
		type: "3rdParty",
		init: vi.fn(),
	},
	Trans: ({ children }: { children: React.ReactNode }) => children, // Mock the Trans component
}));

// Mock window.location
const mockLocation = {
	pathname: "/",
	search: "",
	href: "http://localhost/", // Add a valid href
	replace: vi.fn(),
};
Object.defineProperty(window, "location", {
	value: mockLocation,
	writable: true,
});

// Mock window.history
const mockHistory = {
	pushState: vi.fn(),
	replaceState: vi.fn(),
};
Object.defineProperty(window, "history", {
	value: mockHistory,
	writable: true,
});

describe("App 404 handling", () => {
	const renderApp = (initialEntries = ["/"]) => {
		return render(
			<MemoryRouter initialEntries={initialEntries}>
				<Theme>
					<DialogProvider>
						<TooltipProvider>
							<Routes>
								<Route path="*" element={<App />} />
							</Routes>
						</TooltipProvider>
					</DialogProvider>
				</Theme>
			</MemoryRouter>
		);
	};

	beforeEach(() => {
		// Reset the platform store before each test
		usePlatformStore.setState({ selectedPlatform: "standard" });
		// Clear all mocks
		vi.clearAllMocks();
		mockLocation.pathname = "/";
		mockLocation.search = "";
		mockLocation.replace.mockClear();
		mockHistory.pushState.mockClear();
		mockHistory.replaceState.mockClear();
	});

	test("should redirect to /status/404 and not add ?platform=standard when navigating to an unknown route", async () => {
		mockLocation.pathname = "/unknown-route"; // Set the pathname for the test
		const rendered = renderApp(["/unknown-route"]); // Capture the returned value

		// Expect the URL to be redirected to /status/404
		await waitFor(() => {
			expect(mockLocation.replace).toHaveBeenCalledWith("/status/404");
		});
		expect(rendered.getByText("notFound.title")).toBeInTheDocument();
	});
	
	test("should not redirect when navigating directly to /status/404", async () => {
		mockLocation.pathname = "/status/404";
		renderApp(["/status/404"]);

		await waitFor(() => {
			expect(mockLocation.replace).not.toHaveBeenCalled();
		});
	});
});
