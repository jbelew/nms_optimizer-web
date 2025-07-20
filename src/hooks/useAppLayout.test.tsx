import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { useAppLayout } from './useAppLayout';
import { useBreakpoint } from './useBreakpoint';

// Mock useBreakpoint
vi.mock('./useBreakpoint', () => ({
  useBreakpoint: vi.fn(),
}));

describe('useAppLayout', () => {
  const mockUseBreakpoint = useBreakpoint as vi.Mock;

  // Helper component to render the hook
  const TestComponent = () => {
    const { containerRef, gridTableRef, isLarge: hookIsLarge } = useAppLayout();

    return (
      <div ref={containerRef} data-testid="container">
        <div ref={gridTableRef} data-testid="grid-table">
          <span data-testid="is-large">{hookIsLarge ? 'large' : 'small'}</span>
        </div>
      </div>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return isLarge as true when breakpoint is matched', () => {
    mockUseBreakpoint.mockReturnValue(true); // Simulate large screen
    render(<TestComponent />);
    expect(screen.getByTestId('is-large')).toHaveTextContent('large');
  });

  it('should return isLarge as false when breakpoint is not matched', () => {
    mockUseBreakpoint.mockReturnValue(false); // Simulate small screen
    render(<TestComponent />);
    expect(screen.getByTestId('is-large')).toHaveTextContent('small');
  });
});

