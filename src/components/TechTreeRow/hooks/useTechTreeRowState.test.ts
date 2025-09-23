import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useTechTreeRowState } from './useTechTreeRowState';
import { useGridStore } from '../../../store/GridStore';
import { useTechStore } from '../../../store/TechStore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../store/GridStore');
vi.mock('../../../store/TechStore');

describe('useTechTreeRowState', () => {
  beforeEach(() => {
    (useGridStore as unknown as vi.Mock).mockReturnValue({
      hasTechInGrid: vi.fn().mockReturnValue(false),
    });
    (useTechStore as unknown as vi.Mock).mockReturnValue({
      techGroups: {},
      activeGroups: {},
      max_bonus: {},
      solved_bonus: {},
      checkedModules: {},
    });
  });

  it('should return the initial state', () => {
    const { result } = renderHook(() => useTechTreeRowState('test-tech', 'test.png'));

    expect(result.current.hasTechInGrid).toBe(false);
    expect(result.current.translatedTechName).toBe('technologies.test');
  });
});
