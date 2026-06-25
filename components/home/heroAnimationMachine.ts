export type HeroMediaState =
  | 'fallback'
  | 'loading'
  | 'idle'
  | 'seeking-forward'
  | 'forward'
  | 'holding-end'
  | 'seeking-reverse'
  | 'reverse'
  | 'error';

export type HeroVisibleMedia = 'poster' | 'forward' | 'reverse';

type InteractiveVideoInput = {
  reducedMotion: boolean;
  hoverCapable: boolean;
  saveData?: boolean;
};

export const HERO_ANIMATION_START_TIME = 0;
export const HERO_TRANSITION_TIMEOUT_MS = 1_800;

export const INTERACTIVE_HERO_STATES = new Set<HeroMediaState>([
  'loading',
  'idle',
  'seeking-forward',
  'forward',
  'holding-end',
  'seeking-reverse',
  'reverse',
]);

export function canUseInteractiveHeroVideo({
  reducedMotion,
  hoverCapable,
  saveData,
}: InteractiveVideoInput): boolean {
  return !reducedMotion && hoverCapable && saveData !== true;
}

export function clampMediaTime(time: number, duration: number): number {
  if (!Number.isFinite(time) || time < 0) return 0;
  if (!Number.isFinite(duration) || duration <= 0) return time;
  return Math.min(duration, time);
}

export function getMirroredMediaTime(duration: number, currentTime: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return clampMediaTime(duration - clampMediaTime(currentTime, duration), duration);
}
