import { describe, expect, it } from 'vitest';
import { deriveOpaqueToken, hashOpaqueValue } from '@/lib/security/opaque-token';

describe('opaque public tokens', () => {
  it('derives the same opaque token for an idempotent replay', () => {
    expect(deriveOpaqueToken('checkout-key', 'pepper')).toBe(
      deriveOpaqueToken('checkout-key', 'pepper'),
    );
  });

  it('changes output when the private pepper changes', () => {
    expect(deriveOpaqueToken('checkout-key', 'pepper-a')).not.toBe(
      deriveOpaqueToken('checkout-key', 'pepper-b'),
    );
  });

  it('stores only a one-way token hash', () => {
    expect(hashOpaqueValue('public-token', 'pepper')).toMatch(/^[a-f0-9]{64}$/);
  });
});
