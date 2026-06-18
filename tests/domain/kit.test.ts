import { describe, expect, it } from 'vitest';
import { createCartItem } from '@/domain/cart/cart';
import {
  createKitPieceSelection,
  createKitSelection,
  describeSelection,
} from '@/domain/cart/selection';
import { getProductBySlug } from '@/domain/products/products';

describe('kit domain', () => {
  it('requires three independent configurations', () => {
    const product = getProductBySlug('kit-selecao-3-camisetas');
    expect(product).toBeDefined();

    const selection = createKitSelection([
      createKitPieceSelection(1, 'logo-lateral', 'preto', 'P'),
      createKitPieceSelection(2, 'logo-central', 'branco-off-white', 'M'),
      createKitPieceSelection(3, 'assinatura-lateral', 'marrom', 'G'),
    ]);

    const item = createCartItem(product!, selection, 1);
    const description = describeSelection(item.selection);

    expect(item.unitPriceCents).toBe(11490);
    expect(description).toEqual([
      'Peça 1: Logo lateral, Preto, tamanho P',
      'Peça 2: Logo central, Branco/off-white, tamanho M',
      'Peça 3: Assinatura lateral, Marrom, tamanho G',
    ]);
  });

  it('rejects kits with fewer than three pieces', () => {
    expect(() =>
      createKitSelection([
        createKitPieceSelection(1, 'logo-lateral', 'preto', 'P'),
        createKitPieceSelection(2, 'logo-central', 'branco-off-white', 'M'),
      ]),
    ).toThrow('exatamente três');
  });
});
