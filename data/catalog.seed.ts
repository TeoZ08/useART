import { KIT_APPLICATIONS, PRODUCT_COLORS, PRODUCT_SIZES } from '@/domain/products/catalog';
import type { CatalogProduct, ProductColor } from '@/types/commerce';

const onDemand = {
  mode: 'sob-encomenda',
  label: 'Operação predominantemente sob encomenda',
} as const;

const pendingMedia = (alt: string, pendingReason: string) => ({
  status: 'pending' as const,
  alt,
  pendingReason,
});

const availableMedia = (
  src: string,
  alt: string,
  cutoutStatus: 'available' | 'needs-review' | 'not-applicable' = 'not-applicable',
) => ({
  status: 'available' as const,
  src,
  alt,
  cutoutStatus,
});

const colorFile = {
  'branco-off-white': 'branco',
  preto: 'preto',
  marrom: 'marrom',
} as const;

const colorMedia = (folder: string, altPrefix: string): readonly ProductColor[] =>
  PRODUCT_COLORS.map((color) => ({
    ...color,
    media: {
      ...availableMedia(
        color.id === 'branco-off-white'
          ? `/assets/products/${folder}/${colorFile[color.id]}.png`
          : `/assets/products/cutouts/${folder}-${colorFile[color.id]}.png`,
        `${altPrefix} na cor ${color.name}`,
        color.id === 'branco-off-white' ? 'needs-review' : 'available',
      ),
      colorId: color.id,
    },
  }));

const firstColorMedia = (colors: readonly ProductColor[]) => {
  const media = colors[0]?.media;

  if (!media) {
    throw new Error('Produto com imagem por cor precisa ter mídia principal.');
  }

  return media;
};

const hybridLogoLateralColors = colorMedia(
  'hybrid-logo-lateral',
  'Camiseta Híbrida ART com logo lateral',
);
const hybridLogoCentralColors = colorMedia(
  'hybrid-logo-central',
  'Camiseta Híbrida ART com logo central',
);
const hybridAssinaturaColors = colorMedia(
  'hybrid-assinatura',
  'Camiseta Híbrida ART com assinatura lateral',
);

const moletomColors: readonly ProductColor[] = [
  {
    id: 'branco-off-white',
    name: 'Branco',
    hex: '#f4f4f1',
    media: {
      ...availableMedia(
        '/assets/products/moletom/branco.webp',
        'Moletom ART branco, vista frontal',
        'available',
      ),
      colorId: 'branco-off-white',
    },
  },
  {
    id: 'preto',
    name: 'Preto',
    hex: '#050505',
    media: {
      ...availableMedia(
        '/assets/products/moletom/preto.webp',
        'Moletom ART preto, vista frontal',
        'available',
      ),
      colorId: 'preto',
    },
  },
  {
    id: 'creme',
    name: 'Creme',
    hex: '#e8e1d0',
    media: {
      ...availableMedia(
        '/assets/products/moletom/creme.webp',
        'Moletom ART creme, vista frontal',
        'available',
      ),
      colorId: 'creme',
    },
  },
];
const solidAssinaturaColors = colorMedia(
  'solid-assinatura',
  'Camiseta Solid Masculina ART com assinatura lateral',
);

const catalogSeedData = [
  {
    slug: 'moletom-art',
    name: 'Moletom ART',
    line: 'Moletom',
    category: 'Moletom',
    kind: 'simple',
    priceCents: 10990,
    description: 'Moletom ART em tecido três cabos, com assinatura da marca no peito.',
    colors: moletomColors,
    sizes: PRODUCT_SIZES,
    media: firstColorMedia(moletomColors),
    gallery: moletomColors.map((color) => color.media!),
    confirmedFacts: ['Tecido três cabos.', 'Preço confirmado: R$ 109,90.'],
    pendingFacts: ['Peso.', 'Composição detalhada.', 'Guia de medidas.'],
    operation: onDemand,
    seo: {
      title: 'Moletom ART | Conforto em movimento',
      description: 'Moletom ART três cabos, disponível sob encomenda.',
    },
  },
  {
    slug: 'camiseta-hibrida-logo-lateral',
    name: 'Camiseta Híbrida - logo lateral',
    line: 'Híbrida',
    category: 'Camiseta',
    kind: 'simple',
    priceCents: 4500,
    description:
      'Camiseta Híbrida com logo lateral da ART. Peça streetwear jovem, esportiva e funcional.',
    colors: hybridLogoLateralColors,
    sizes: PRODUCT_SIZES,
    media: firstColorMedia(hybridLogoLateralColors),
    gallery: hybridLogoLateralColors.map((color) => color.media!),
    confirmedFacts: ['Proteção UV 30.', 'Preço confirmado: R$ 45,00.'],
    pendingFacts: ['Composição e cuidados oficiais.', 'Guia de medidas revisado.'],
    operation: onDemand,
    seo: {
      title: 'Camiseta Híbrida logo lateral ART',
      description: 'Camiseta Híbrida com logo lateral, proteção UV 30 e compra assistida.',
    },
  },
  {
    slug: 'camiseta-hibrida-logo-central',
    name: 'Camiseta Híbrida - logo central',
    line: 'Híbrida',
    category: 'Camiseta',
    kind: 'simple',
    priceCents: 4500,
    description:
      'Camiseta Híbrida com logo central. As imagens autorizadas cobrem as variações branco/off-white, preto e marrom.',
    colors: hybridLogoCentralColors,
    sizes: PRODUCT_SIZES,
    media: firstColorMedia(hybridLogoCentralColors),
    gallery: hybridLogoCentralColors.map((color) => color.media!),
    confirmedFacts: ['Proteção UV 30.', 'Preço confirmado: R$ 45,00.'],
    pendingFacts: ['Composição e cuidados oficiais.', 'Guia de medidas revisado.'],
    operation: onDemand,
    seo: {
      title: 'Camiseta Híbrida logo central ART',
      description: 'Camiseta Híbrida com logo central, proteção UV 30 e atendimento via WhatsApp.',
    },
  },
  {
    slug: 'camiseta-hibrida-assinatura-lateral',
    name: 'Camiseta Híbrida - assinatura lateral',
    line: 'Híbrida',
    category: 'Camiseta',
    kind: 'simple',
    priceCents: 4500,
    description:
      'Camiseta Híbrida com assinatura lateral. As imagens autorizadas cobrem as variações branco/off-white, preto e marrom.',
    colors: hybridAssinaturaColors,
    sizes: PRODUCT_SIZES,
    media: firstColorMedia(hybridAssinaturaColors),
    gallery: hybridAssinaturaColors.map((color) => color.media!),
    confirmedFacts: ['Proteção UV 30.', 'Preço confirmado: R$ 45,00.'],
    pendingFacts: ['Composição e cuidados oficiais.', 'Guia de medidas revisado.'],
    operation: onDemand,
    seo: {
      title: 'Camiseta Híbrida assinatura lateral ART',
      description: 'Camiseta Híbrida com assinatura lateral e compra assistida pelo WhatsApp.',
    },
  },
  {
    slug: 'kit-selecao-3-camisetas',
    name: 'Kit Seleção - 3 camisetas',
    line: 'Kit Seleção',
    category: 'Kit',
    kind: 'kit',
    priceCents: 11490,
    description:
      'Kit com três camisetas configuradas individualmente. Cada peça permite escolher aplicação, cor e tamanho.',
    colors: PRODUCT_COLORS,
    sizes: PRODUCT_SIZES,
    applications: KIT_APPLICATIONS,
    media: availableMedia(
      '/assets/products/kit/selecao-3-camisetas.webp',
      'Kit Seleção ART com três camisetas em composição editorial',
      'available',
    ),
    gallery: [
      availableMedia(
        '/assets/products/kit/selecao-3-camisetas.webp',
        'Kit Seleção ART com três camisetas em composição editorial',
        'available',
      ),
    ],
    confirmedFacts: ['Três camisetas no kit.', 'Preço confirmado: R$ 114,90.'],
    pendingFacts: ['Regras de disponibilidade.'],
    operation: onDemand,
    seo: {
      title: 'Kit Seleção ART com 3 camisetas',
      description: 'Kit ART com três camisetas e configuração independente por peça.',
    },
  },
  {
    slug: 'camiseta-solid-masculina-logo-central',
    name: 'Camiseta Solid Masculina - logo central',
    line: 'Solid Masculina',
    category: 'Camiseta',
    kind: 'simple',
    priceCents: 5000,
    description:
      'Camiseta Solid Masculina com logo central. Benefícios do tecido dependem do fabricante e serão confirmados antes da venda.',
    colors: PRODUCT_COLORS,
    sizes: PRODUCT_SIZES,
    media: pendingMedia(
      'Placeholder da Camiseta Solid Masculina com logo central',
      'Imagem da Solid Masculina com logo central ainda pendente.',
    ),
    gallery: [],
    confirmedFacts: ['Preço confirmado: R$ 50,00.'],
    pendingFacts: [
      'Imagem do SKU.',
      'Benefícios documentados pelo fabricante.',
      'Composição e cuidados.',
    ],
    operation: onDemand,
    seo: {
      title: 'Camiseta Solid Masculina logo central ART',
      description: 'Camiseta Solid Masculina com logo central e atendimento direto.',
    },
  },
  {
    slug: 'camiseta-solid-masculina-assinatura-lateral',
    name: 'Camiseta Solid Masculina - assinatura lateral',
    line: 'Solid Masculina',
    category: 'Camiseta',
    kind: 'simple',
    priceCents: 5000,
    description:
      'Camiseta Solid Masculina com assinatura lateral. Benefícios informados pelo fabricante serão mantidos como pendência até validação.',
    colors: solidAssinaturaColors,
    sizes: PRODUCT_SIZES,
    media: firstColorMedia(solidAssinaturaColors),
    gallery: solidAssinaturaColors.map((color) => color.media!),
    confirmedFacts: ['Preço confirmado: R$ 50,00.'],
    pendingFacts: [
      'Benefícios documentados pelo fabricante.',
      'Composição e cuidados.',
      'Guia de medidas.',
    ],
    operation: onDemand,
    seo: {
      title: 'Camiseta Solid Masculina assinatura lateral ART',
      description: 'Camiseta Solid Masculina com assinatura lateral e compra assistida.',
    },
  },
] as const;

export const catalogSeed: CatalogProduct[] = catalogSeedData.map((product) => ({
  ...product,
  variants: [],
  commerceAvailable: false,
}));
