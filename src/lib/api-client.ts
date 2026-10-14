import type { MobileAppSettings } from './types';

export async function fetchSettings(): Promise<MobileAppSettings> {
  const res = await fetch('/api/settings', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function saveSettings(
  partial: Partial<MobileAppSettings>
): Promise<MobileAppSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
}
