import { useState, useEffect, useCallback } from 'react';
import { type Settings, DEFAULT_SETTINGS } from '../../types';
import { getSettings, saveSettings } from '../../lib/db';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const update = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const setTextSize = useCallback(
    (size: number) =>
      update({ ...settings, textSize: Math.min(36, Math.max(14, size)) }),
    [settings, update]
  );

  const toggleTheme = useCallback(
    () => update({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' }),
    [settings, update]
  );

  return { settings, setTextSize, toggleTheme };
}
