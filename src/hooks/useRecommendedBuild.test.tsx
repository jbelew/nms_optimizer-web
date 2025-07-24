import { act,renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { createEmptyCell,createGrid, useGridStore } from '../store/GridStore';
import { useRecommendedBuild } from './useRecommendedBuild';
import type { RecommendedBuild,TechTree } from './useTechTree';

// Mock useGridStore
vi.mock('../store/GridStore', () => ({
  useGridStore: {
    getState: vi.fn(),
  },
  createGrid: vi.fn(),
  createEmptyCell: vi.fn(),
}));

describe('useRecommendedBuild', () => {
  let setGridAndResetAuxiliaryStateMock: vi.Mock;
  let scrollToMock: vi.Mock;
  let requestAnimationFrameMock: vi.Mock;
  let mockTechTree: TechTree;
  let mockGridContainerRef: React.MutableRefObject<HTMLDivElement | null>;

  beforeEach(() => {
    vi.clearAllMocks();

    setGridAndResetAuxiliaryStateMock = vi.fn();
    (useGridStore.getState as vi.Mock).mockReturnValue({
      setGridAndResetAuxiliaryState: setGridAndResetAuxiliaryStateMock,
    });

    // Mock createGrid and createEmptyCell to return predictable values
    (createGrid as vi.Mock).mockImplementation((width, height) => ({
      cells: Array(height).fill(0).map(() => Array(width).fill(null)),
      width,
      height,
    }));
    (createEmptyCell as vi.Mock).mockImplementation((supercharged = false, active = false) => ({
      tech: '', module: '', label: '', image: null, bonus: 0, value: 0, adjacency: false, sc_eligible: false, supercharged, active, adjacency_bonus: 0.0, type: ''
    }));

    scrollToMock = vi.fn();
    Object.defineProperty(window, 'scrollTo', { value: scrollToMock, writable: true });
    requestAnimationFrameMock = vi.fn((cb) => cb()); // Immediately execute callback
    Object.defineProperty(window, 'requestAnimationFrame', { value: requestAnimationFrameMock, writable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });

    mockTechTree = {
      Weapon: [
        { key: 'boltcaster', label: 'Boltcaster', modules: [{ id: 'S1', label: 'S-Class', bonus: 10, image: 'img.png', adjacency: true, sc_eligible: true, value: 1, type: 'weapon' }] },
      ],
      Shield: [
        { key: 'shield', label: 'Shield', modules: [{ id: 'X1', label: 'X-Class', bonus: 20, image: 'img2.png', adjacency: false, sc_eligible: false, value: 2, type: 'shield' }] },
      ],
    };

    mockGridContainerRef = { current: document.createElement('div') };
    Object.defineProperty(mockGridContainerRef.current, 'getBoundingClientRect', {
      value: () => ({ top: 100, height: 0, width: 0, x: 0, y: 0, right: 0, bottom: 0, left: 0 }),
      configurable: true,
    });
  });

  it('should return applyRecommendedBuild function', () => {
    const { result } = renderHook(() => useRecommendedBuild(mockTechTree, mockGridContainerRef));
    expect(typeof result.current.applyRecommendedBuild).toBe('function');
  });

  

  it('should apply a recommended build and set the grid', () => {
    const mockBuild: RecommendedBuild = {
      title: 'Test Build',
      layout: [
        [{ tech: 'boltcaster', module: 'S1', supercharged: true, active: true, adjacency_bonus: 1.0 }, null],
        [null, { tech: 'shield', module: 'X1', supercharged: false, active: true, adjacency_bonus: 0.0 }],
      ],
    };

    const { result } = renderHook(() => useRecommendedBuild(mockTechTree, mockGridContainerRef));

    act(() => {
      result.current.applyRecommendedBuild(mockBuild);
    });

    expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
    const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
    expect(newGrid.cells[0][0]).toEqual(expect.objectContaining({
      tech: 'boltcaster',
      module: 'S1',
      supercharged: true,
      active: true,
      adjacency_bonus: 1.0,
    }));
    expect(newGrid.cells[1][1]).toEqual(expect.objectContaining({
      tech: 'shield',
      module: 'X1',
      supercharged: false,
      active: true,
      adjacency_bonus: 0.0,
    }));
    expect(newGrid.cells[0][1]).toEqual(expect.objectContaining({
      tech: '', // Should be empty cell
    }));
  });

  it('should scroll to grid container after applying build', () => {
    const mockBuild: RecommendedBuild = {
      title: 'Test Build',
      layout: [
        [{ tech: 'boltcaster', module: 'S1' }],
      ],
    };

    const { result } = renderHook(() => useRecommendedBuild(mockTechTree, mockGridContainerRef));

    act(() => {
      result.current.applyRecommendedBuild(mockBuild);
    });

    expect(requestAnimationFrameMock).toHaveBeenCalled();
    expect(scrollToMock).toHaveBeenCalledWith({
      top: 92, // 100 (top) + 0 (pageYOffset) - 8 (offset)
      behavior: 'smooth',
    });
  });

  it('should not apply build if build or layout is null', () => {
    const { result } = renderHook(() => useRecommendedBuild(mockTechTree, mockGridContainerRef));

    act(() => {
      result.current.applyRecommendedBuild(null);
    });
    expect(setGridAndResetAuxiliaryStateMock).not.toHaveBeenCalled();

    act(() => {
      result.current.applyRecommendedBuild({ title: 'Empty', layout: null });
    });
    expect(setGridAndResetAuxiliaryStateMock).not.toHaveBeenCalled();
  });

  it('should handle missing module in layout', () => {
    const mockBuild: RecommendedBuild = {
      title: 'Test Build',
      layout: [
        [{ tech: 'nonexistent', module: 'module', supercharged: false, active: true }],
      ],
    };

    const { result } = renderHook(() => useRecommendedBuild(mockTechTree, mockGridContainerRef));

    act(() => {
      result.current.applyRecommendedBuild(mockBuild);
    });

    expect(setGridAndResetAuxiliaryStateMock).toHaveBeenCalledTimes(1);
    const newGrid = setGridAndResetAuxiliaryStateMock.mock.calls[0][0];
    expect(newGrid.cells[0][0]).toEqual(expect.objectContaining({
      tech: '', // Should be empty cell if module not found
      module: '',
    }));
  });
});
