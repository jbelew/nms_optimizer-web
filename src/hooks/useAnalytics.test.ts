import { act,renderHook } from '@testing-library/react';
import ReactGA from 'react-ga4';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { vi } from 'vitest';

import { TRACKING_ID } from '../constants';
import { reportWebVitals } from '../reportWebVitals';
import { useAnalytics } from './useAnalytics';

// Mock ReactGA and reportWebVitals
vi.mock('react-ga4');
vi.mock('../reportWebVitals');
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        useLocation: vi.fn(),
    };
});

describe('useAnalytics', () => {
    const mockUseLocation = useLocation as vi.Mock;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        // Default mock for useLocation
        mockUseLocation.mockReturnValue({ pathname: '/', search: '' });
        // Reset environment variable for consistent testing
        import.meta.env.DEV = false; 
    });

    it('should initialize ReactGA and reportWebVitals once on mount', () => {
        const { rerender } = renderHook(() => useAnalytics(), {
            wrapper: BrowserRouter,
        });

        // Expect initialize and reportWebVitals to be called on first mount
        expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
        expect(ReactGA.initialize).toHaveBeenCalledWith(TRACKING_ID, { testMode: false });
        expect(reportWebVitals).toHaveBeenCalledTimes(1);

        // Rerender the hook, initialize should not be called again
        rerender();
        expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
        expect(reportWebVitals).toHaveBeenCalledTimes(1);
    });

    it('should not send pageview on initial mount but set ref', () => {
        mockUseLocation.mockReturnValue({ pathname: '/initial', search: '?param=test' });
        renderHook(() => useAnalytics(), {
            wrapper: BrowserRouter,
        });

        // Initial pageview should NOT be sent, but ref should be set
        expect(ReactGA.event).not.toHaveBeenCalled();
        // To check initialPageViewSentRef, we'd need to expose it or test its side effect on subsequent calls
        // For now, we rely on the next test to confirm its effect.
    });

    it('should send pageview on subsequent navigation', () => {
        // Initial mount (this will set initialPageViewSentRef.current = true)
        mockUseLocation.mockReturnValue({ pathname: '/page1', search: '' });
        const { rerender } = renderHook(() => useAnalytics(), {
            wrapper: BrowserRouter,
        });
        expect(ReactGA.event).not.toHaveBeenCalled(); // No pageview on first mount

        // Simulate navigation to page2
        mockUseLocation.mockReturnValue({ pathname: '/page2', search: '?query=abc' });
        act(() => rerender()); // Force re-render for useLocation change

        expect(ReactGA.event).toHaveBeenCalledTimes(1);
        expect(ReactGA.event).toHaveBeenCalledWith({
            category: 'Page View',
            action: 'page_view',
            page: '/page2?query=abc',
            title: document.title,
        });

        // Simulate navigation to page3
        mockUseLocation.mockReturnValue({ pathname: '/page3', search: '' });
        act(() => rerender()); // Force re-render for useLocation change

        expect(ReactGA.event).toHaveBeenCalledTimes(2);
        expect(ReactGA.event).toHaveBeenCalledWith({
            category: 'Page View',
            action: 'page_view',
            page: '/page3',
            title: document.title,
        });
    });

    it('should correctly set testMode based on import.meta.env.DEV', () => {
        import.meta.env.DEV = true;
        renderHook(() => useAnalytics(), {
            wrapper: BrowserRouter,
        });
        expect(ReactGA.initialize).toHaveBeenCalledWith(TRACKING_ID, { testMode: true });
    });

    it('should send custom events via sendEvent function', () => {
        const { result } = renderHook(() => useAnalytics(), {
            wrapper: BrowserRouter,
        });

        act(() => {
            result.current.sendEvent({
                category: 'User Action',
                action: 'Button Click',
                label: 'Submit',
                value: 10,
                platform: 'web',
                tech: 'react',
            });
        });

        expect(ReactGA.event).toHaveBeenCalledTimes(1);
        expect(ReactGA.event).toHaveBeenCalledWith({
            category: 'User Action',
            action: 'Button Click',
            label: 'Submit',
            value: 10,
            platform: 'web',
            tech: 'react',
        });
    });
});