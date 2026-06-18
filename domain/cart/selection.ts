import { findColor, KIT_APPLICATIONS, PRODUCT_COLORS } from '@/domain/products/catalog';
import type {
  KitPieceSelection,
  KitSelection,
  ProductApplicationId,
  ProductColorId,
  ProductSize,
  SimpleSelection,
} from '@/types/commerce';

export function createSimpleSelection(colorId: ProductColorId, size: ProductSize): SimpleSelection {
  const color = findColor(colorId, PRODUCT_COLORS);

  return {
    type: 'simple',
    colorId,
    colorName: color.name,
    size,
  };
}

export function createKitPieceSelection(
  pieceNumber: 1 | 2 | 3,
  applicationId: ProductApplicationId,
  colorId: ProductColorId,
  size: ProductSize,
): KitPieceSelection {
  const application =
    KIT_APPLICATIONS.find((item) => item.id === applicationId) ?? KIT_APPLICATIONS[0];
  const color = findColor(colorId, PRODUCT_COLORS);

  return {
    pieceNumber,
    applicationId,
    applicationName: application.name,
    colorId,
    colorName: color.name,
    size,
  };
}

export function createKitSelection(pieces: KitPieceSelection[]): KitSelection {
  if (pieces.length !== 3) {
    throw new Error('O Kit Seleção exige exatamente três configurações.');
  }

  return {
    type: 'kit',
    pieces: pieces as [KitPieceSelection, KitPieceSelection, KitPieceSelection],
  };
}

export function describeSelection(selection: SimpleSelection | KitSelection): string[] {
  if (selection.type === 'simple') {
    return [`Cor: ${selection.colorName}`, `Tamanho: ${selection.size}`];
  }

  return selection.pieces.map(
    (piece) =>
      `Peça ${piece.pieceNumber}: ${piece.applicationName}, ${piece.colorName}, tamanho ${piece.size}`,
  );
}
