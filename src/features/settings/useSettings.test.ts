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
    expect(result.current.settings.textSize).toBe(16);
    expect(result.current.settings.theme).toBe('dark');
  });

  it('setTextSize clamps to 12-24', async () => {
    const { result } = renderHook(() => useSettings());
    await act(async () => {});
    act(() => result.current.setTextSize(30));
    expect(result.current.settings.textSize).toBe(24);
    act(() => result.current.setTextSize(5));
    expect(result.current.settings.textSize).toBe(12);
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
