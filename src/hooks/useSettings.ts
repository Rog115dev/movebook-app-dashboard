'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MobileAppSettings } from '@/lib/types';

export function useSettings() {
  const [settings, setSettings] = useState<MobileAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      setSettings(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (partial: Partial<MobileAppSettings>) => {
      setSaving(true);
      setMessage('');
      setError('');
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partial),
        });
        if (!res.ok) throw new Error('Save failed');
        const next = (await res.json()) as MobileAppSettings;
        setSettings(next);
        setMessage(`Saved · v${next.version}`);
        return next;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed');
        return null;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return { settings, setSettings, loading, saving, error, message, save, reload: load };
}
