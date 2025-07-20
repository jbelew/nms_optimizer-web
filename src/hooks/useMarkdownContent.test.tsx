import { renderHook, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { vi } from 'vitest';

import { useMarkdownContent } from './useMarkdownContent';

// Mock react-i18next's useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('useMarkdownContent', () => {
  const mockUseTranslation = useTranslation as vi.Mock;
  let fetchSpy: vi.SpyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the cache before each test
    // @ts-expect-error - Accessing private map for testing
    useMarkdownContent.__clearCache?.();

    // Default mock for useTranslation
    mockUseTranslation.mockReturnValue({
      i18n: {
        language: 'en-US',
        options: { fallbackLng: ['en'] },
      },
      t: (key: string) => key, // Simple mock for translation function
    });

    // Mock global fetch
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('should fetch markdown content successfully', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('# Test Markdown'),
    });

    const { result } = renderHook(() => useMarkdownContent('test-file'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.markdown).toBe('');
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.markdown).toBe('# Test Markdown');
      expect(result.current.error).toBeNull();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('/assets/locales/en/test-file.md');
  });

  it('should use cached content if available', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('# Cached Markdown'),
    });

    // First render to populate cache
    const { result, rerender } = renderHook(() => useMarkdownContent('cached-file'));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    // Second render, should use cache
    rerender();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.markdown).toBe('# Cached Markdown');
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1); // Should not fetch again
  });

  it('should handle fetch error', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useMarkdownContent('non-existent-file'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.markdown).toContain('Failed to load content');
      expect(result.current.error).toContain('Failed to load non-existent-file.md');
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('should fall back to default language if specific language not found', async () => {
    mockUseTranslation.mockReturnValue({
      i18n: {
        language: 'fr-FR',
        options: { fallbackLng: ['en'] },
      },
      t: (key: string) => key,
    });

    fetchSpy
      .mockResolvedValueOnce({ ok: false, status: 404 }) // French not found
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('# English Fallback') }); // English found

    const { result } = renderHook(() => useMarkdownContent('localized-file'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.markdown).toBe('# English Fallback');
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenCalledWith('/assets/locales/fr/localized-file.md');
    expect(fetchSpy).toHaveBeenCalledWith('/assets/locales/en/localized-file.md');
  });

  it('should always fetch changelog in English', async () => {
    mockUseTranslation.mockReturnValue({
      i18n: {
        language: 'de-DE',
        options: { fallbackLng: ['en'] },
      },
      t: (key: string) => key,
    });

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('# Changelog EN'),
    });

    const { result } = renderHook(() => useMarkdownContent('changelog'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.markdown).toBe('# Changelog EN');
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('/assets/locales/en/changelog.md');
  });

  it('should handle network error during fetch', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('Network request failed'));

    const { result } = renderHook(() => useMarkdownContent('network-error-file'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.markdown).toContain('Failed to load content');
      expect(result.current.error).toContain('Network request failed');
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
