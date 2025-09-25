import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, Mock, vi } from "vitest";

import { useGridStore } from "@/store/GridStore";
import { useShakeStore } from "@/store/ShakeStore";
import { useTechStore } from "@/store/TechStore";

import { useTechOptimization } from "./useTechOptimization";

// Mock stores
vi.mock("@/store/GridStore");
vi.mock("@/store/ShakeStore");
vi.mock("@/store/TechStore");

describe("useTechOptimization", () => {
	const mockResetGridTech = vi.fn();
	const mockClearTechMaxBonus = vi.fn();
	const mockClearTechSolvedBonus = vi.fn();
	const mockSetShaking = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: { resetGridTech: () => void }) => unknown) =>
				selector({ resetGridTech: mockResetGridTech })
		);
		(useShakeStore as unknown as Mock).mockReturnValue({ setShaking: mockSetShaking });
		(useTechStore as unknown as Mock).mockReturnValue({
			clearTechMaxBonus: mockClearTechMaxBonus,
			clearTechSolvedBonus: mockClearTechSolvedBonus,
		});
	});

	it("should call reset and optimize when grid is not full", async () => {
		const handleOptimize = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() =>
			useTechOptimization("testTech", handleOptimize, false, false)
		);

		await act(async () => {
			await result.current.handleOptimizeClick();
		});

		expect(mockResetGridTech).toHaveBeenCalledWith("testTech");
		expect(mockClearTechMaxBonus).toHaveBeenCalledWith("testTech");
		expect(mockClearTechSolvedBonus).toHaveBeenCalledWith("testTech");
		expect(handleOptimize).toHaveBeenCalledWith("testTech");
		expect(mockSetShaking).not.toHaveBeenCalled();
	});

	it("should call setShaking when grid is full and tech is not in grid", async () => {
		vi.useFakeTimers();
		const handleOptimize = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() =>
			useTechOptimization("testTech", handleOptimize, true, false)
		);

		await act(async () => {
			await result.current.handleOptimizeClick();
		});

		expect(mockSetShaking).toHaveBeenCalledWith(true);
		act(() => {
			vi.runAllTimers();
		});
		expect(mockSetShaking).toHaveBeenCalledWith(false);
		expect(handleOptimize).not.toHaveBeenCalled();
		vi.useRealTimers();
	});

	it("should call handleReset correctly", () => {
		const handleOptimize = vi.fn();
		const { result } = renderHook(() =>
			useTechOptimization("testTech", handleOptimize, false, true)
		);

		act(() => {
			result.current.handleReset();
		});

		expect(mockResetGridTech).toHaveBeenCalledWith("testTech");
		expect(mockClearTechMaxBonus).toHaveBeenCalledWith("testTech");
		expect(mockClearTechSolvedBonus).toHaveBeenCalledWith("testTech");
	});
});
