import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TechTreeRowModuleSelectionDialog } from './TechTreeRowModuleSelectionDialog';
import { TooltipProvider } from '@radix-ui/react-tooltip';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
    }),
}));

const modules = [
    { id: 'sigma', label: 'Sigma Upgrade', type: 'upgrade' },
    { id: 'tau', label: 'Tau Upgrade', type: 'upgrade' },
    { id: 'theta', label: 'Theta Upgrade', type: 'upgrade' },
];

describe('TechTreeRowModuleSelectionDialog', () => {
    it('should disable Tau and Theta upgrades initially', () => {
        render(
            <TooltipProvider>
                <TechTreeRowModuleSelectionDialog
                    modules={modules}
                    currentCheckedModules={[]}
                    handleCheckboxChange={vi.fn()}
                    handleAllCheckboxesChange={vi.fn()}
                    translatedTechName="Test Tech"
                    moduleCount={3}
                    currentCheckedModulesLength={0}
                />
            </TooltipProvider>
        );

        fireEvent.click(screen.getByText('0 / 3'));

        expect(screen.getByLabelText('Sigma Upgrade')).not.toBeDisabled();
        expect(screen.getByLabelText('Tau Upgrade')).toBeDisabled();
        expect(screen.getByLabelText('Theta Upgrade')).toBeDisabled();
    });

    it('should enable Tau upgrade when Sigma is selected', () => {
        render(
            <TooltipProvider>
                <TechTreeRowModuleSelectionDialog
                    modules={modules}
                    currentCheckedModules={['sigma']}
                    handleCheckboxChange={vi.fn()}
                    handleAllCheckboxesChange={vi.fn()}
                    translatedTechName="Test Tech"
                    moduleCount={3}
                    currentCheckedModulesLength={1}
                />
            </TooltipProvider>
        );

        fireEvent.click(screen.getByText('1 / 3'));

        expect(screen.getByLabelText('Sigma Upgrade')).not.toBeDisabled();
        expect(screen.getByLabelText('Tau Upgrade')).not.toBeDisabled();
        expect(screen.getByLabelText('Theta Upgrade')).toBeDisabled();
    });

    it('should enable Theta upgrade when Tau is selected', () => {
        render(
            <TooltipProvider>
                <TechTreeRowModuleSelectionDialog
                    modules={modules}
                    currentCheckedModules={['sigma', 'tau']}
                    handleCheckboxChange={vi.fn()}
                    handleAllCheckboxesChange={vi.fn()}
                    translatedTechName="Test Tech"
                    moduleCount={3}
                    currentCheckedModulesLength={2}
                />
            </TooltipProvider>
        );

        fireEvent.click(screen.getByText('2 / 3'));

        expect(screen.getByLabelText('Sigma Upgrade')).not.toBeDisabled();
        expect(screen.getByLabelText('Tau Upgrade')).not.toBeDisabled();
        expect(screen.getByLabelText('Theta Upgrade')).not.toBeDisabled();
    });
});
