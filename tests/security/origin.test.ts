import { describe, expect, it } from 'vitest';
import { hasTrustedOrigin } from '@/lib/security/origin';

describe('same-origin mutation protection', () => {
  it('accepts the exact origin used to reach a deployment alias', () => {
    const request = new Request('https://preview.example.com/api/checkout/create-order', {
      headers: { origin: 'https://preview.example.com' },
    });
    expect(hasTrustedOrigin(request)).toBe(true);
  });

  it('rejects cross-origin, missing and malformed origins', () => {
    expect(
      hasTrustedOrigin(
        new Request('https://preview.example.com/api/checkout/create-order', {
          headers: { origin: 'https://attacker.example' },
        }),
      ),
    ).toBe(false);
    expect(
      hasTrustedOrigin(new Request('https://preview.example.com/api/checkout/create-order')),
    ).toBe(false);
    expect(
      hasTrustedOrigin(
        new Request('https://preview.example.com/api/checkout/create-order', {
          headers: { origin: 'not a url' },
        }),
      ),
    ).toBe(false);
  });
});
