// src/components/MainAppContent/useMainAppLogic.test.ts
import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { registerToolbarForceShow } from "../../hooks/useScrollGridIntoView/useScrollGridIntoView";
import { usePlatformStore } from "../../store/PlatformStore";
import { useSessionStore } from "../../store/SessionStore";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";
import { useMainAppLogic } from "./useMainAppLogic";

// Mock external dependencies
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("../../context/dialog-utils", () => ({
	useDialog: () => ({
		openDialog: vi.fn(),
	}),
}));

vi.mock("../../hooks/useAppLayout/useAppLayout", () => ({
	useAppLayout: () => ({
		containerRef: { current: null },
		gridTableRef: { current: null },
		gridTableTotalWidth: 1000,
	}),
}));

vi.mock("../../hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: (breakpoint: string) => breakpoint === "1024px",
}));

vi.mock("../../hooks/useErrorDispatcher", () => ({
	useErrorDispatcher: vi.fn(),
}));

vi.mock("../../hooks/useLoadBuild/useLoadBuild", () => ({
	useLoadBuild: () => ({
		fileInputRef: { current: null },
		handleLoadBuild: vi.fn(),
		handleFileSelect: vi.fn(),
	}),
}));

vi.mock("../../hooks/useOptimize/useOptimize", () => ({
	useOptimize: () => ({
		solving: false,
		progressPercent: 0,
		status: "idle",
		handleOptimize: vi.fn(),
		gridContainerRef: { current: null },
		patternNoFitTech: null,
		clearPatternNoFitTech: vi.fn(),
		handleForceCurrentPnfOptimize: vi.fn(),
	}),
}));

vi.mock("../../hooks/useSaveBuild/useSaveBuild", () => ({
	useSaveBuild: () => ({
		isSaveBuildDialogOpen: false,
		handleSaveBuild: vi.fn(),
		handleBuildNameConfirm: vi.fn(),
		handleBuildNameCancel: vi.fn(),
	}),
}));

vi.mock("../../hooks/useScrollGridIntoView/useScrollGridIntoView", () => ({
	registerToolbarForceShow: vi.fn(),
}));

vi.mock("../../hooks/useScrollHide/useScrollHide", () => ({
	useScrollHide: () => ({
		isVisible: true,
		toolbarRef: { current: null },
		forceShow: vi.fn(),
	}),
}));

vi.mock("../../hooks/useToast/useToast", () => ({
	useToast: () => ({
		showSuccess: vi.fn(),
		showError: vi.fn(),
	}),
}));

vi.mock("../../store/GridStore", () => ({
	useGridStore: (selector: (state: unknown) => unknown) =>
		selector({ isSharedGrid: false, selectHasModulesInGrid: () => true }),
}));

vi.mock("../../utils/splashScreen", () => ({
	hideSplashScreenAndShowBackground: vi.fn(),
}));

vi.mock("../../store/PlatformStore", () => ({
	usePlatformStore: vi.fn((selector: (state: unknown) => unknown) =>
		selector({ selectedPlatform: "standard" })
	),
}));

vi.mock("../../store/SessionStore", () => ({
	useSessionStore: vi.fn(() => ({
		resetSession: vi.fn(),
	})),
}));

vi.mock("../../store/TechTreeLoadingStore", () => ({
	useTechTreeLoadingStore: {
		getState: () => ({
			setLoading: vi.fn(),
		}),
	},
}));

describe("useMainAppLogic", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with correct state values", () => {
		const { result } = renderHook(() => useMainAppLogic());

		expect(result.current.isSharedGrid).toBe(false);
		expect(result.current.isLargeScreen).toBe(true);
		expect(result.current.isSmallScreen).toBe(true);
		expect(result.current.isVisible).toBe(true);
	});

	it("should reset session when platform changes", () => {
		const resetSession = vi.fn();
		(useSessionStore as unknown as Mock).mockReturnValue({ resetSession });

		let platform = "standard";
		(usePlatformStore as unknown as Mock).mockImplementation(
			(selector: (state: unknown) => unknown) => selector({ selectedPlatform: platform })
		);

		const { rerender } = renderHook(() => useMainAppLogic());

		expect(resetSession).toHaveBeenCalledTimes(1);

		platform = "corvette";
		rerender();

		expect(resetSession).toHaveBeenCalledTimes(2);
	});

	it("should hide splash screen on mount", () => {
		renderHook(() => useMainAppLogic());
		expect(hideSplashScreenAndShowBackground).toHaveBeenCalled();
	});

	it("should register toolbar force show on mount", () => {
		renderHook(() => useMainAppLogic());
		expect(registerToolbarForceShow).toHaveBeenCalled();
	});
});
