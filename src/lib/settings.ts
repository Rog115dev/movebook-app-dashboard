import { promises as fs } from 'fs';
import path from 'path';
import { createDefaultSettings } from './defaults';
import type { MobileAppSettings } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_PATH = path.join(DATA_DIR, 'mobile-settings.json');

export async function readSettings(): Promise<MobileAppSettings> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
    return JSON.parse(raw) as MobileAppSettings;
  } catch {
    const defaults = createDefaultSettings();
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(defaults, null, 2), 'utf8');
    return defaults;
  }
}

export async function writeSettings(
  next: MobileAppSettings
): Promise<MobileAppSettings> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const payload: MobileAppSettings = {
    ...next,
    version: (next.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

export async function patchSettings(
  partial: Partial<MobileAppSettings>
): Promise<MobileAppSettings> {
  const current = await readSettings();
  return writeSettings({
    ...current,
    ...partial,
    version: current.version,
  });
}
