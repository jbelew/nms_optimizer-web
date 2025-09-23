import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { TechTreeRow } from './TechTreeRow';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
    }),
}));

describe('TechTreeRow', () => {
  const mockProps = {
    tech: 'test-tech',
    handleOptimize: vi.fn(),
    solving: false,
    techImage: 'test.png',
    isGridFull: false,
    selectedShipType: 'fighter',
    techColor: 'blue' as const,
    hasTechInGrid: false,
    translatedTechName: 'Test Tech',
    techMaxBonus: 100,
    techSolvedBonus: 0,
    moduleCount: 3,
    currentCheckedModules: [],
    hasRewardModules: false,
    rewardModules: [],
    imagePath: '/assets/img/tech/test.png',
    imagePath2x: '/assets/img/tech/test@2x.png',
    hasMultipleGroups: false,
    activeGroup: { modules: [] },
    handleReset: vi.fn(),
    handleCheckboxChange: vi.fn(),
    handleAllCheckboxesChange: vi.fn(),
    handleOptimizeClick: vi.fn(),
    handleGroupChange: vi.fn(),
  };

  it('renders the tech name', () => {
    render(
      <TooltipProvider>
        <TechTreeRow {...mockProps} />
      </TooltipProvider>
    );
    expect(screen.getByText('Test Tech')).toBeInTheDocument();
  });

  it('shows the solved bonus when the tech is in the grid', () => {
    render(
      <TooltipProvider>
        <TechTreeRow {...mockProps} hasTechInGrid={true} techSolvedBonus={50} />
      </TooltipProvider>
    );
    expect(screen.getByText('50.00%')).toBeInTheDocument();
  });

  it('disables the optimize button when the grid is full and the tech is not in the grid', () => {
    render(
      <TooltipProvider>
        <TechTreeRow {...mockProps} isGridFull={true} hasTechInGrid={false} />
      </TooltipProvider>
    );
    const optimizeButton = screen.getByLabelText('techTree.tooltips.gridFull Test Tech');
    expect(optimizeButton).toBeDisabled();
  });
});
