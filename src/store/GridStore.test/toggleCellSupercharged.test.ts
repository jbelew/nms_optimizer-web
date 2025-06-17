import { describe, it, expect, beforeEach } from 'vitest';
import { useGridStore, createGrid, createEmptyCell, type Grid } from '../GridStore';
import { act } from '@testing-library/react';

describe('toggleCellSupercharged action in GridStore', () => {
  beforeEach(() => {
    act(() => {
      useGridStore.getState().resetGrid();
      const defaultTestGrid = createGrid(3, 3);
      defaultTestGrid.cells.forEach(row => row.forEach(cell => {
        Object.assign(cell, createEmptyCell(false, true)); // Default: active, not supercharged
      }));
      useGridStore.setState({ grid: defaultTestGrid, result: null, isSharedGrid: false });
    });
  });

  // Helper to modify the current grid state for a specific test
  const modifyGridSetup = (setupCallback: (grid: Grid) => void) => {
    act(() => {
      const currentGrid = useGridStore.getState().grid;
      const newGrid = JSON.parse(JSON.stringify(currentGrid)); // Deep clone
      setupCallback(newGrid);
      useGridStore.setState({ grid: newGrid });
    });
  };

  it('should supercharge an active, non-supercharged cell', () => {
    // Cell at (0,0) is active and not supercharged by default from beforeEach

    act(() => {
      useGridStore.getState().toggleCellSupercharged(0, 0);
    });

    const finalCell = useGridStore.getState().grid.cells[0][0];
    expect(finalCell.supercharged).toBe(true);
    expect(finalCell.active).toBe(true); // Ensure active status didn't change
  });

  it('should de-supercharge an active, supercharged cell', () => {
    modifyGridSetup(grid => {
      grid.cells[1][1].active = true;
      grid.cells[1][1].supercharged = true;
    });

    act(() => {
      useGridStore.getState().toggleCellSupercharged(1, 1);
    });

    const finalCell = useGridStore.getState().grid.cells[1][1];
    expect(finalCell.supercharged).toBe(false);
    expect(finalCell.active).toBe(true); // Ensure active status didn't change
  });

  it('should not supercharge an inactive cell', () => {
    modifyGridSetup(grid => {
      grid.cells[2][2].active = false;
      grid.cells[2][2].supercharged = false;
    });

    act(() => {
      useGridStore.getState().toggleCellSupercharged(2, 2);
    });

    const finalCell = useGridStore.getState().grid.cells[2][2];
    expect(finalCell.supercharged).toBe(false); // Should remain false
    expect(finalCell.active).toBe(false); // Should remain inactive
  });

  it('should not de-supercharge an inactive, supercharged cell (edge case)', () => {
    // This is an edge case: an inactive cell that is somehow supercharged.
    // The current logic of toggleCellSupercharged only acts if cell.active is true.
    modifyGridSetup(grid => {
      grid.cells[0][1].active = false;
      grid.cells[0][1].supercharged = true;
    });

    act(() => {
      useGridStore.getState().toggleCellSupercharged(0, 1);
    });

    const finalCell = useGridStore.getState().grid.cells[0][1];
    expect(finalCell.supercharged).toBe(true); // Should remain true as it's inactive
    expect(finalCell.active).toBe(false);
  });
});
