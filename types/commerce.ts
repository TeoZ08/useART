export type ProductSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG';

export type ProductColorId = 'branco-off-white' | 'preto' | 'marrom' | 'a-confirmar';

export type ProductApplicationId = 'logo-lateral' | 'logo-central' | 'assinatura-lateral';

export type ProductKind = 'simple' | 'kit';

export type ProductImageStatus = 'available' | 'partial' | 'pending';
export type CutoutStatus = 'available' | 'needs-review' | 'not-applicable';

export interface ProductColor {
  id: ProductColorId;
  name: string;
  hex: string;
  media?: ProductMedia;
}

export interface ProductApplication {
  id: ProductApplicationId;
  name: string;
}

export interface ProductMedia {
  status: ProductImageStatus;
  alt: string;
  src?: string;
  pendingReason?: string;
  cutoutStatus?: CutoutStatus;
}

export interface CatalogProduct {
  slug: string;
  name: string;
  line: string;
  category: string;
  kind: ProductKind;
  priceCents: number;
  description: string;
  colors: readonly ProductColor[];
  sizes: readonly ProductSize[];
  media: ProductMedia;
  gallery: readonly ProductMedia[];
  applications?: readonly ProductApplication[];
  confirmedFacts: string[];
  pendingFacts: string[];
  operation: {
    mode: 'sob-encomenda' | 'sob-consulta';
    label: string;
    leadTime?: string;
  };
  seo: {
    title: string;
    description: string;
  };
}

export interface SimpleSelection {
  type: 'simple';
  colorId: ProductColorId;
  colorName: string;
  size: ProductSize;
}

export interface KitPieceSelection {
  pieceNumber: 1 | 2 | 3;
  applicationId: ProductApplicationId;
  applicationName: string;
  colorId: ProductColorId;
  colorName: string;
  size: ProductSize;
}

export interface KitSelection {
  type: 'kit';
  pieces: [KitPieceSelection, KitPieceSelection, KitPieceSelection];
}

export type CartItemSelection = SimpleSelection | KitSelection;

export interface CartItem {
  id: string;
  productSlug: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  image: ProductMedia;
  selection: CartItemSelection;
}

export interface CartTotals {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number | null;
  totalCents: number | null;
}
