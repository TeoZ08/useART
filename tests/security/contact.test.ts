import { describe, expect, it } from 'vitest';
import { normalizeEmail, normalizePhone } from '@/lib/security/contact';

describe('contact normalization', () => {
  it('normalizes Brazilian local phones with country code', () => {
    expect(normalizePhone('(67) 99169-1441')).toBe('5567991691441');
  });

  it('keeps an existing Brazilian country code', () => {
    expect(normalizePhone('+55 67 99169-1441')).toBe('5567991691441');
  });

  it('rejects malformed phones', () => {
    expect(() => normalizePhone('123')).toThrow('Telefone inválido');
  });

  it('normalizes emails', () => {
    expect(normalizeEmail('  MARIA@EXAMPLE.COM ')).toBe('maria@example.com');
  });
});
