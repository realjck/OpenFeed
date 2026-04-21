import { IDBFactory } from 'fake-indexeddb';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSettings } from './useSettings';

beforeEach(() => {
  (global as any).indexedDB = new IDBFactory();
});

describe('useSettings', () => {
  it('initializes with default settings', async () => {
    const { result } = renderHook(() => useSettings());
    await act(async () => {});
    expect(result.current.settings.textSize).toBe(18);
    expect(result.current.settings.theme).toBe('dark');
  });

  it('setTextSize clamps to 14-36', async () => {
    const { result } = renderHook(() => useSettings());
    await act(async () => {});
    act(() => result.current.setTextSize(40));
    expect(result.current.settings.textSize).toBe(36);
    act(() => result.current.setTextSize(5));
    expect(result.current.settings.textSize).toBe(14);
  });

  it('toggleTheme switches between light and dark', async () => {
    const { result } = renderHook(() => useSettings());
    await act(async () => {});
    act(() => result.current.toggleTheme());
    expect(result.current.settings.theme).toBe('light');
    act(() => result.current.toggleTheme());
    expect(result.current.settings.theme).toBe('dark');
  });
});
