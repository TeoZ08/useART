import type {
  ProductApplication,
  ProductColor,
  ProductColorId,
  ProductSize,
} from '@/types/commerce';

export const PRODUCT_SIZES = [
  'PP',
  'P',
  'M',
  'G',
  'GG',
  'XG',
] as const satisfies readonly ProductSize[];

export const PRODUCT_COLORS = [
  { id: 'branco-off-white', name: 'Branco/off-white', hex: '#f4f4f1' },
  { id: 'preto', name: 'Preto', hex: '#050505' },
  { id: 'marrom', name: 'Marrom', hex: '#5b371a' },
] as const satisfies readonly ProductColor[];

export const PENDING_COLOR = {
  id: 'a-confirmar',
  name: 'A confirmar no atendimento',
  hex: '#8b8b86',
} as const satisfies ProductColor;

export const KIT_APPLICATIONS = [
  { id: 'logo-lateral', name: 'Logo lateral' },
  { id: 'logo-central', name: 'Logo central' },
  { id: 'assinatura-lateral', name: 'Assinatura lateral' },
] as const satisfies readonly ProductApplication[];

export function findColor(colorId: ProductColorId, colors: readonly ProductColor[]): ProductColor {
  return colors.find((color) => color.id === colorId) ?? PENDING_COLOR;
}

export function isProductSize(value: string): value is ProductSize {
  return PRODUCT_SIZES.includes(value as ProductSize);
}
