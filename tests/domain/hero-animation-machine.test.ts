import { describe, expect, it } from 'vitest';
import {
  canUseInteractiveHeroVideo,
  clampMediaTime,
  getMirroredMediaTime,
} from '@/components/home/heroAnimationMachine';

describe('hero animation machine helpers', () => {
  it('mirrors forward and reverse timestamps inside the media duration', () => {
    expect(getMirroredMediaTime(8.366, 0)).toBeCloseTo(8.366);
    expect(getMirroredMediaTime(8.366, 2.0915)).toBeCloseTo(6.2745);
    expect(getMirroredMediaTime(8.366, 4.183)).toBeCloseTo(4.183);
    expect(getMirroredMediaTime(8.366, 8.366)).toBeCloseTo(0);
  });

  it('clamps invalid media times before transitions use them', () => {
    expect(clampMediaTime(Number.NaN, 8.366)).toBe(0);
    expect(clampMediaTime(-1, 8.366)).toBe(0);
    expect(clampMediaTime(12, 8.366)).toBe(8.366);
  });

  it('enables animation only for fine hover without reduced motion or save-data', () => {
    expect(
      canUseInteractiveHeroVideo({
        reducedMotion: false,
        hoverCapable: true,
        saveData: false,
      }),
    ).toBe(true);

    expect(
      canUseInteractiveHeroVideo({
        reducedMotion: true,
        hoverCapable: true,
        saveData: false,
      }),
    ).toBe(false);
    expect(
      canUseInteractiveHeroVideo({
        reducedMotion: false,
        hoverCapable: false,
        saveData: false,
      }),
    ).toBe(false);
    expect(
      canUseInteractiveHeroVideo({
        reducedMotion: false,
        hoverCapable: true,
        saveData: true,
      }),
    ).toBe(false);
  });
});
