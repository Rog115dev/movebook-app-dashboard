import type { ColorSettings } from './types';

/** Canonical default palette (same as createDefaultSettings().colors). */
export const DEFAULT_COLORS: ColorSettings = {
  bg: '#0A0A0A',
  bgElevated: '#141414',
  bgCard: '#161616',
  white: '#FFFFFF',
  whiteMuted: 'rgba(255,255,255,0.78)',
  whiteDim: 'rgba(255,255,255,0.52)',
  orange: '#FF7800',
  orangeHot: '#FF8F2A',
  gold: '#FF7800',
  goldSoft: '#FFA04A',
  red: '#E53935',
  border: 'rgba(255,255,255,0.16)',
  borderSoft: 'rgba(255,120,0,0.28)',
  borderOrange: 'rgba(255,120,0,0.95)',
  black: '#000000',
};

export const COLOR_KEY_LABELS: Record<keyof ColorSettings, string> = {
  orange: 'Brand orange',
  orangeHot: 'Orange hot',
  gold: 'Gold',
  goldSoft: 'Gold soft',
  bg: 'Background',
  bgElevated: 'Elevated background',
  bgCard: 'Card background',
  white: 'White / primary text',
  whiteMuted: 'Muted text',
  whiteDim: 'Dim text',
  red: 'Alert red',
  border: 'Border',
  borderSoft: 'Soft border',
  borderOrange: 'Orange border',
  black: 'Black',
};
