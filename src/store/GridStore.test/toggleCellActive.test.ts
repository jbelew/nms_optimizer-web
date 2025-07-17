import { describe, it, expect, beforeEach } from 'vitest';
import { useGridStore, createGrid, createEmptyCell, type Grid } from '../GridStore';
import { act } from '@testing-library/react'; // Or 'react-dom/test-utils' if not using RTL

// Using the actual store, resetting state for each test.

describe('toggleCellActive action in GridStore', () => {
  beforeEach(() => {
    // Reset the store to a default state before each test
    act(() => {
      // Assuming resetGrid() sets grid to a default 10x6 or similar,
      // and resets result, isSharedGrid.
      useGridStore.getState().resetGrid();
      // If resetGrid doesn't set a predictable small grid for tests,
      // we might need to explicitly set a small grid afterwards:
      const defaultTestGrid = createGrid(3, 3); // Ensure a known small grid for tests
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
      // The callback directly mutates the draft of the grid from the store
      // This is okay if the store uses immer, or if we setState afterwards.
      // To be safe, let's clone, modify, and then setState.
      // However, since GridStore uses immer, direct mutation inside 'set' is the norm.
      // Here, we are modifying outside 'set', so we must call 'setState'.
      const newGrid = JSON.parse(JSON.stringify(currentGrid)); // Deep clone for safety
      setupCallback(newGrid);
      useGridStore.setState({ grid: newGrid });
    });
  };

  it('should activate an inactive cell', () => {
    modifyGridSetup(grid => {
      grid.cells[0][0].active = false;
      grid.cells[0][0].supercharged = false;
    });

    act(() => {
      // console.log('Type of toggleCellActive:', typeof useGridStore.getState().toggleCellActive);
      // console.log('Keys in store state:', Object.keys(useGridStore.getState()));
      useGridStore.getState().toggleCellActive(0, 0);
    });

    const finalCell = useGridStore.getState().grid.cells[0][0];
    expect(finalCell.active).toBe(true);
    expect(finalCell.supercharged).toBe(false); // Should not change supercharged status on activation
  });

  it('should not deactivate an active supercharged cell, even if it does not contain a module', () => {
    act(() => {
      const grid = useGridStore.getState().grid;
      grid.cells[1][1].active = true;
      grid.cells[1][1].module = null;
      grid.cells[1][1].supercharged = true; // Start supercharged
      useGridStore.setState({ grid });
    });

    act(() => {
      useGridStore.getState().toggleCellActive(1, 1);
    });

    const finalCell = useGridStore.getState().grid.cells[1][1];
    expect(finalCell.active).toBe(true); // Should remain active
    expect(finalCell.supercharged).toBe(true); // Should remain supercharged
  });

  it('should not deactivate an active cell if it contains a module', () => {
    modifyGridSetup(grid => {
      grid.cells[2][2].active = true;
      grid.cells[2][2].module = 'some_module_id';
      grid.cells[2][2].supercharged = true;
    });

    act(() => {
      useGridStore.getState().toggleCellActive(2, 2);
    });

    const finalCell = useGridStore.getState().grid.cells[2][2];
    expect(finalCell.active).toBe(true); // Should remain active
    expect(finalCell.supercharged).toBe(true); // Should remain supercharged
  });

  it('should set supercharged to false when a cell is deactivated', () => {
    act(() => {
      const grid = useGridStore.getState().grid;
      grid.cells[0][1].active = true;
      grid.cells[0][1].module = null; // No module
      grid.cells[0][1].supercharged = false; // Changed to false
      useGridStore.setState({ grid });
    });

    act(() => {
      useGridStore.getState().toggleCellActive(0, 1);
    });

    const finalCell = useGridStore.getState().grid.cells[0][1];
    expect(finalCell.active).toBe(false);
    expect(finalCell.supercharged).toBe(false);
  });

  it('should not change supercharged status when activating an inactive cell (supercharged initially false)', () => {
    modifyGridSetup(grid => {
      grid.cells[0][2].active = false;
      grid.cells[0][2].supercharged = false;
    });

    act(() => {
      useGridStore.getState().toggleCellActive(0, 2);
    });

    const finalCell = useGridStore.getState().grid.cells[0][2];
    expect(finalCell.active).toBe(true);
    expect(finalCell.supercharged).toBe(false); // Stays false
  });

  it('should not change active or supercharged status when calling toggleCellActive on an inactive supercharged cell', () => {
    modifyGridSetup(grid => {
      grid.cells[1][0].active = false;
      grid.cells[1][0].supercharged = true; // Unusual, but testable
    });

    act(() => {
      useGridStore.getState().toggleCellActive(1, 0);
    });

    const finalCell = useGridStore.getState().grid.cells[1][0];
    expect(finalCell.active).toBe(false); // Stays false
    expect(finalCell.supercharged).toBe(true); // Stays true
  });
});
