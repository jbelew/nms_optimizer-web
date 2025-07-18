import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAppLayout } from './useAppLayout';
import { useBreakpoint } from './useBreakpoint';
import { useGridStore } from '../store/GridStore';
import React from 'react';

// Mock ResizeObserver
let resizeObserverCallback: ResizeObserverCallback;
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

global.ResizeObserver = vi.fn((cb) => {
  resizeObserverCallback = cb;
  return {
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  };
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock useBreakpoint
vi.mock('./useBreakpoint', () => ({
  useBreakpoint: vi.fn(),
}));

// Mock useGridStore
vi.mock('../store/GridStore', () => ({
  useGridStore: vi.fn(),
}));

describe('useAppLayout', () => {
  const mockUseBreakpoint = useBreakpoint as vi.Mock;
  const mockUseGridStore = useGridStore as vi.Mock;

  // Helper component to render the hook
  const TestComponent = () => {
    const { containerRef, gridTableRef, gridHeight, gridTableTotalWidth, isLarge: hookIsLarge } = useAppLayout();

    return (
      <div ref={containerRef} data-testid="container">
        <div ref={gridTableRef} data-testid="grid-table">
          <span data-testid="grid-height">{gridHeight}</span>
          <span data-testid="grid-table-total-width">{gridTableTotalWidth}</span>
          <span data-testid="is-large">{hookIsLarge ? 'large' : 'small'}</span>
        </div>
      </div>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the stored callback for ResizeObserver
    resizeObserverCallback = undefined;

    // Default mocks for useBreakpoint and useGridStore
    mockUseBreakpoint.mockReturnValue(true); // Assume large screen by default
    mockUseGridStore.mockReturnValue({ isSharedGrid: false }); // Assume not shared grid by default
  });

  it('should initialize with null gridHeight and undefined gridTableTotalWidth', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('grid-height')).toHaveTextContent('');
    expect(screen.getByTestId('grid-table-total-width')).toHaveTextContent('');
    expect(screen.getByTestId('is-large')).toHaveTextContent('large');
  });

  it('should observe containerRef and gridTableRef', () => {
    render(<TestComponent />);
    const container = screen.getByTestId('container');
    const gridTable = screen.getByTestId('grid-table');

    expect(mockObserve).toHaveBeenCalledTimes(2);
    expect(mockObserve).toHaveBeenCalledWith(container);
    expect(mockObserve).toHaveBeenCalledWith(gridTable);
  });

  it('should update gridHeight when isLarge is true and not shared grid', () => {
    render(<TestComponent />);
    const container = screen.getByTestId('container');

    // Simulate dimensions for the container
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ height: 500, width: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0 }),
      configurable: true,
    });

    // Trigger ResizeObserver callback
    act(() => {
      resizeObserverCallback([
        { target: container, contentRect: { height: 500, width: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0 } } as ResizeObserverEntry,
      ]);
    });

    expect(screen.getByTestId('grid-height')).toHaveTextContent('500');
    expect(screen.getByTestId('is-large')).toHaveTextContent('large');
  });

  it('should not update gridHeight when isLarge is false', () => {
    mockUseBreakpoint.mockReturnValue(false); // Simulate small screen
    render(<TestComponent />);
    const container = screen.getByTestId('container');

    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ height: 500, width: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0 }),
      configurable: true,
    });

    act(() => {
      resizeObserverCallback([
        { target: container, contentRect: { height: 500, width: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0 } } as ResizeObserverEntry,
      ]);
    });

    expect(screen.getByTestId('grid-height')).toHaveTextContent(''); // gridHeight should remain null
    expect(screen.getByTestId('is-large')).toHaveTextContent('small');
  });

  it('should not update gridHeight when isSharedGrid is true', () => {
    mockUseGridStore.mockReturnValue({ isSharedGrid: true }); // Simulate shared grid
    render(<TestComponent />);
    const container = screen.getByTestId('container');

    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ height: 500, width: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0 }),
      configurable: true,
    });

    act(() => {
      resizeObserverCallback([
        { target: container, contentRect: { height: 500, width: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0 } } as ResizeObserverEntry,
      ]);
    });

    expect(screen.getByTestId('grid-height')).toHaveTextContent(''); // gridHeight should remain null
    expect(screen.getByTestId('is-large')).toHaveTextContent('large');
  });

  it('should update gridTableTotalWidth', () => {
    render(<TestComponent />);
    const gridTable = screen.getByTestId('grid-table');

    Object.defineProperty(gridTable, 'offsetWidth', { value: 1000, configurable: true });
    // For ResizeObserverEntry, contentRect.width is used
    // The hook also uses offsetWidth as a fallback, so we mock both.
    Object.defineProperty(gridTable, 'getBoundingClientRect', {
      value: () => ({ width: 1000, height: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0 }),
      configurable: true,
    });

    act(() => {
      resizeObserverCallback([
        { target: gridTable, contentRect: { width: 1000, height: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0 } } as ResizeObserverEntry,
      ]);
    });

    // GRID_TABLE_WIDTH_ADJUSTMENT is -40
    expect(screen.getByTestId('grid-table-total-width')).toHaveTextContent('960');
    expect(screen.getByTestId('is-large')).toHaveTextContent('large');
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<TestComponent />);
    unmount();

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
