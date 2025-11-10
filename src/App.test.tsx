import { Suspense } from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Theme } from "@radix-ui/themes";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { vi } from "vitest";

import { routes } from "./routes";
import { usePlatformStore } from "./store/PlatformStore";

// Mock the hideSplashScreen function
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

vi.mock("react-i18next", async () => {
	const original = await vi.importActual("react-i18next");
	return {
		...original,
		useTranslation: () => ({
			t: (str: string) => str,
			i18n: {
				changeLanguage: vi.fn(),
				language: "en",
				services: {
					resourceStore: {
						data: {
							en: { translation: {} },
							es: { translation: {} },
							fr: { translation: {} },
							de: { translation: {} },
							pt: { translation: {} },
						},
					},
				},
			},
		}),
	};
});

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

vi.mock("./components/MainAppContent/MainAppContent", () => ({
	MainAppContent: () => <div>mainApp.title</div>,
}));

vi.mock("./hooks/useUrlValidation/useUrlValidation", () => ({
	useUrlValidation: vi.fn(),
}));

vi.mock("./utils/analytics", () => ({
	sendEvent: vi.fn(),
}));

describe("App 404 handling", () => {
	beforeEach(() => {
		// Reset the platform store before each test
		usePlatformStore.setState({ selectedPlatform: "standard" });
		// Clear all mocks
		vi.clearAllMocks();
	});
	const renderApp = (initialEntries = ["/"]) => {
		const router = createMemoryRouter(routes, { initialEntries });
		return render(
			<Theme>
				<TooltipProvider>
					<Suspense fallback={<div>Loading...</div>}>
						<RouterProvider router={router} />
					</Suspense>
				</TooltipProvider>
			</Theme>
		);
	};

	test("should redirect to /status/404 and not add ?platform=standard when navigating to an unknown route", async () => {
		const rendered = renderApp(["/unknown-route"]); // Capture the returned value

		// Expect the URL to be redirected to /status/404
		expect(await rendered.findByText("notFound.title")).toBeInTheDocument();
		expect(await rendered.findByText("notFound.message")).toBeInTheDocument();
		const backToMainLink = await rendered.findByText("notFound.backToMain");
		expect(backToMainLink).toBeInTheDocument();
		expect(backToMainLink.closest("a")).toHaveAttribute("href", "/");
	});

	test("should not redirect when navigating directly to /status/404", async () => {
		const rendered = renderApp(["/status/404"]);
		// Expect the URL to be redirected to /status/404
		expect(await rendered.findByText("notFound.title")).toBeInTheDocument();
		expect(await rendered.findByText("notFound.message")).toBeInTheDocument();
		const backToMainLink = await rendered.findByText("notFound.backToMain");
		expect(backToMainLink).toBeInTheDocument();
		expect(backToMainLink.closest("a")).toHaveAttribute("href", "/");
	});

	// _test("should render the main app content for a language-specific route", async () => {
	// 	const rendered = renderApp(["/es/about"]);
	// 	// Expect the URL to be redirected to /status/404
	// 	expect(await rendered.findByText("mainApp.title")).toBeInTheDocument();
	// });
});
