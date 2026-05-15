// src/components/MainAppContent/useMainAppLogic.test.ts
import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { registerToolbarForceShow } from "../../hooks/useScrollGridIntoView/useScrollGridIntoView";
import { usePlatformStore } from "../../store/app/platformStore";
import { useSessionStore } from "../../store/app/sessionStore";
import { hideSplashScreenAndShowBackground } from "../../utils/system/splashScreen";
import { useMainAppLogic } from "./useMainAppLogic";

// Mock external dependencies
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("../../utils/system/dialogUtils", () => ({
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
		handleFileSelect: vi.fn(),
		handleLoadBuild: vi.fn(),
	}),
}));

vi.mock("../../hooks/useOptimize/useOptimize", () => ({
	useOptimize: () => ({
		clearPatternNoFitTech: vi.fn(),
		gridContainerRef: { current: null },
		handleForceCurrentPnfOptimize: vi.fn(),
		handleOptimize: vi.fn(),
		patternNoFitTech: null,
		progressPercent: 0,
		solving: false,
		status: "idle",
	}),
}));

vi.mock("../../hooks/useSaveBuild/useSaveBuild", () => ({
	useSaveBuild: () => ({
		handleBuildNameCancel: vi.fn(),
		handleBuildNameConfirm: vi.fn(),
		handleSaveBuild: vi.fn(),
		isSaveBuildDialogOpen: false,
	}),
}));

vi.mock("../../hooks/useScrollGridIntoView/useScrollGridIntoView", () => ({
	registerToolbarForceShow: vi.fn(),
}));

vi.mock("../../hooks/useScrollHide/useScrollHide", () => ({
	useScrollHide: () => ({
		forceShow: vi.fn(),
		isVisible: true,
		toolbarRef: { current: null },
	}),
}));

vi.mock("../../hooks/useToast/useToast", () => ({
	useToast: () => ({
		showError: vi.fn(),
		showSuccess: vi.fn(),
	}),
}));

vi.mock("../../store/grid/gridStore", () => ({
	useGridStore: (selector: (state: unknown) => unknown) =>
		selector({ isSharedGrid: false, selectHasModulesInGrid: () => true }),
}));

vi.mock("../../utils/system/splashScreen", () => ({
	hideSplashScreenAndShowBackground: vi.fn(),
}));

vi.mock("../../store/app/platformStore", () => ({
	usePlatformStore: vi.fn((selector: (state: unknown) => unknown) =>
		selector({ selectedPlatform: "standard" })
	),
}));

vi.mock("../../store/app/sessionStore", () => ({
	useSessionStore: vi.fn(() => ({
		resetSession: vi.fn(),
	})),
}));

vi.mock("../../store/tech/techTreeLoadingStore", () => ({
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
