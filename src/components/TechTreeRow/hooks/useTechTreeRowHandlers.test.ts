import { renderHook, act } from '@testing-library/react';
import { useTechTreeRowHandlers } from './useTechTreeRowHandlers';
import { useGridStore } from '../../../store/GridStore';
import { useShakeStore } from '../../../store/ShakeStore';
import { useTechStore } from '../../../store/TechStore';

import { vi } from 'vitest';

vi.mock('../../../store/GridStore');
vi.mock('../../../store/ShakeStore');
vi.mock('../../../store/TechStore');

describe('useTechTreeRowHandlers', () => {
  const mockResetGridTech = vi.fn();
  const mockClearTechMaxBonus = vi.fn();
  const mockClearTechSolvedBonus = vi.fn();
  const mockSetCheckedModules = vi.fn();
  const mockSetActiveGroup = vi.fn();
  const mockSetShaking = vi.fn();
  const mockHandleOptimize = vi.fn();

  beforeEach(() => {
    (useGridStore as unknown as vi.Mock).mockReturnValue({
      resetGridTech: mockResetGridTech,
    });
    (useShakeStore as unknown as vi.Mock).mockReturnValue({
      setShaking: mockSetShaking,
    });
    (useTechStore as unknown as vi.Mock).mockReturnValue({
      clearTechMaxBonus: mockClearTechMaxBonus,
      clearTechSolvedBonus: mockClearTechSolvedBonus,
      setCheckedModules: mockSetCheckedModules,
      setActiveGroup: mockSetActiveGroup,
    });
  });

  it('handleReset should call the correct store actions', () => {
    const { result } = renderHook(() =>
      useTechTreeRowHandlers('test-tech', mockHandleOptimize, false, true)
    );

    act(() => {
      result.current.handleReset();
    });

    expect(mockResetGridTech).toHaveBeenCalledWith('test-tech');
    expect(mockClearTechMaxBonus).toHaveBeenCalledWith('test-tech');
    expect(mockClearTechSolvedBonus).toHaveBeenCalledWith('test-tech');
  });

  it('handleOptimizeClick should shake when grid is full and tech is not in grid', () => {
    const { result } = renderHook(() =>
      useTechTreeRowHandlers('test-tech', mockHandleOptimize, true, false)
    );

    act(() => {
      result.current.handleOptimizeClick();
    });

    expect(mockSetShaking).toHaveBeenCalledWith(true);
  });

  it('handleOptimizeClick should optimize when grid is not full', () => {
    const { result } = renderHook(() =>
      useTechTreeRowHandlers('test-tech', mockHandleOptimize, false, false)
    );

    act(() => {
      result.current.handleOptimizeClick();
    });

    expect(mockResetGridTech).toHaveBeenCalledWith('test-tech');
    expect(mockClearTechMaxBonus).toHaveBeenCalledWith('test-tech');
    expect(mockClearTechSolvedBonus).toHaveBeenCalledWith('test-tech');
    expect(mockHandleOptimize).toHaveBeenCalledWith('test-tech');
  });
});
