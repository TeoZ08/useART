import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORE_WHATSAPP = '556791691441';
const ADMIN_PASSWORD = 'useart2026';

const storageKeys = {
  products: 'useart.products.v2',
  legacyProducts: 'use-art-products-real-v4',
  cart: 'useart.cart.v1',
  orders: 'useart.orders.v1',
};

const productImages = {
  hybridBrown: '/assets/products/hybrid-art-marrom.jpg',
  hybridBrownCutout: '/assets/products/cutouts/hybrid-art-marrom.png',
  hybridBrownAlt: '/assets/products/hybrid-art-marrom-alt.jpg',
  hybridBrownAltCutout: '/assets/products/cutouts/hybrid-art-marrom-alt.png',
  hybridBrownBack: '/assets/products/camiseta-marrom-costas.jpg',
  hybridWhite: '/assets/products/hybrid-art-branca.jpg',
  hybridWhiteCenter: '/assets/products/hybrid-central-branca.jpg',
  whiteBack: '/assets/products/camiseta-branca-costas.jpg',
  hybridBlack: '/assets/products/hybrid-art-preta.jpg',
  hybridBlackCutout: '/assets/products/cutouts/hybrid-art-preta.png',
  hybridBlackAlt: '/assets/products/hybrid-art-preta-alt.jpg',
  hybridBlackAltCutout: '/assets/products/cutouts/hybrid-art-preta-alt.png',
  blackBack: '/assets/products/camiseta-preta-costas.jpg',
  blackBackCutout: '/assets/products/cutouts/camiseta-preta-costas.png',
  signatureBlack: '/assets/products/solid-assinatura-masculina-preta.jpg',
  signatureBlackCutout: '/assets/products/cutouts/solid-assinatura-masculina-preta.png',
  signatureWhite: '/assets/products/solid-assinatura-feminina-branca.jpg',
  signatureBrown: '/assets/products/solid-assinatura-marrom.jpg',
  signatureBrownCutout: '/assets/products/cutouts/solid-assinatura-marrom.png',
};

const defaultColors = [
  { name: 'Branco/off-white', value: '#f4f4f1' },
  { name: 'Preto', value: '#050505' },
  { name: 'Marrom', value: '#5b371a' },
];

const defaultSizes = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

const colorLibrary = {
  'Branco/off-white': '#f4f4f1',
  Branco: '#f4f4f1',
  'Off-white': '#f4f4f1',
  Preto: '#050505',
  Marrom: '#5b371a',
  'Mix de cores': '#111111',
};

function colorVariant(name, image, cutout = image, gallery = [image]) {
  return {
    name,
    value: colorLibrary[name] || '#111111',
    image,
    cutout,
    gallery,
  };
}

const defaultProducts = [
  {
    id: 'camiseta-hybrid',
    name: 'Camiseta Hybrid',
    line: 'Essencial',
    price: 45,
    installment: '10x de R$5,43',
    category: 'Masculino',
    categories: ['Masculino', 'Unissex'],
    colors: [
      colorVariant('Branco/off-white', productImages.hybridWhite, productImages.hybridWhite, [productImages.hybridWhite, productImages.whiteBack]),
      colorVariant('Preto', productImages.hybridBlackAlt, productImages.hybridBlackAltCutout, [productImages.hybridBlackAlt, productImages.blackBack]),
      colorVariant('Marrom', productImages.hybridBrownAlt, productImages.hybridBrownAltCutout, [productImages.hybridBrownAlt, productImages.hybridBrownBack]),
    ],
    sizes: defaultSizes,
    active: true,
    image: productImages.hybridBrownAlt,
    heroImage: productImages.hybridBrownAltCutout,
    gallery: [productImages.hybridBrownAlt, productImages.hybridBrownBack],
    description: 'Camiseta essencial com visual limpo, tecido confortável e proposta minimalista para uso diário.',
  },
  {
    id: 'camiseta-hybrid-art',
    name: 'Camiseta Hybrid Art',
    line: 'Logo lateral',
    price: 45,
    installment: '10x de R$5,43',
    category: 'Masculino',
    categories: ['Masculino', 'Unissex'],
    colors: [
      colorVariant('Branco/off-white', productImages.hybridWhite, productImages.hybridWhite, [productImages.hybridWhite, productImages.whiteBack]),
      colorVariant('Preto', productImages.hybridBlack, productImages.hybridBlackCutout, [productImages.hybridBlack, productImages.blackBack]),
      colorVariant('Marrom', productImages.hybridBrown, productImages.hybridBrownCutout, [productImages.hybridBrown, productImages.hybridBrownBack]),
    ],
    sizes: defaultSizes,
    active: true,
    image: productImages.hybridBrown,
    heroImage: productImages.hybridBrownCutout,
    gallery: [productImages.hybridBrown, productImages.hybridBrownBack],
    description: 'Modelo com aplicação lateral da logo use.a.r.t. Uma peça direta, urbana e fácil de combinar.',
  },
  {
    id: 'camiseta-hybrid-art-central',
    name: 'Camiseta Hybrid Art Central',
    line: 'Logo central',
    price: 45,
    installment: '10x de R$5,43',
    category: 'Unissex',
    categories: ['Unissex'],
    colors: [
      colorVariant('Branco/off-white', productImages.hybridWhiteCenter, productImages.hybridWhiteCenter, [productImages.hybridWhiteCenter, productImages.whiteBack]),
      colorVariant('Preto', productImages.hybridBlackAlt, productImages.hybridBlackAltCutout, [productImages.hybridBlackAlt, productImages.blackBack]),
      colorVariant('Marrom', productImages.hybridBrownAlt, productImages.hybridBrownAltCutout, [productImages.hybridBrownAlt, productImages.hybridBrownBack]),
    ],
    sizes: defaultSizes,
    active: true,
    image: productImages.hybridWhiteCenter,
    heroImage: productImages.hybridBrownAltCutout,
    gallery: [productImages.hybridWhiteCenter, productImages.whiteBack, productImages.hybridBlackAlt, productImages.hybridBrown],
    description: 'Camiseta com logo central. Boa para apresentar a identidade da marca com presença e equilíbrio.',
  },
  {
    id: 'camiseta-hybrid-assinatura',
    name: 'Camiseta Hybrid Assinatura',
    line: 'Assinatura lateral',
    price: 50,
    installment: '12x de R$5,09',
    category: 'Masculino',
    categories: ['Masculino', 'Unissex'],
    colors: [
      colorVariant('Branco/off-white', productImages.signatureWhite, productImages.signatureWhite, [productImages.signatureWhite, productImages.whiteBack]),
      colorVariant('Preto', productImages.signatureBlack, productImages.signatureBlackCutout, [productImages.signatureBlack, productImages.blackBack]),
      colorVariant('Marrom', productImages.signatureBrown, productImages.signatureBrownCutout, [productImages.signatureBrown, productImages.hybridBrownBack]),
    ],
    sizes: defaultSizes,
    active: true,
    image: productImages.signatureBlack,
    heroImage: productImages.signatureBlackCutout,
    gallery: [productImages.signatureBlack, productImages.signatureBrown, productImages.signatureWhite],
    description: 'Versão com assinatura lateral Art. Visual discreto e premium dentro da linha.',
  },
  {
    id: 'camiseta-solid',
    name: 'Camiseta Solid',
    line: 'Básica lisa',
    price: 50,
    installment: '12x de R$5,09',
    category: 'Unissex',
    categories: ['Masculino', 'Feminino', 'Unissex'],
    colors: [
      colorVariant('Branco/off-white', productImages.signatureWhite, productImages.signatureWhite, [productImages.signatureWhite, productImages.whiteBack]),
      colorVariant('Preto', productImages.hybridBlackAlt, productImages.hybridBlackAltCutout, [productImages.hybridBlackAlt, productImages.blackBack]),
      colorVariant('Marrom', productImages.hybridBrownAlt, productImages.hybridBrownAltCutout, [productImages.hybridBrownAlt, productImages.hybridBrownBack]),
    ],
    sizes: defaultSizes,
    active: true,
    image: productImages.hybridBlackAlt,
    heroImage: productImages.hybridBlackAltCutout,
    gallery: [productImages.hybridBlackAlt, productImages.blackBack, productImages.hybridBrownAlt, productImages.hybridWhite],
    description: 'Camiseta lisa para quem prefere uma base neutra, confortável e versátil. Modelagem combinada no atendimento.',
  },
  {
    id: 'camiseta-solid-assinatura',
    name: 'Camiseta Solid Assinatura',
    line: 'Assinatura lateral',
    price: 50,
    installment: '12x de R$5,09',
    category: 'Unissex',
    categories: ['Masculino', 'Feminino', 'Unissex'],
    colors: [
      colorVariant('Branco/off-white', productImages.signatureWhite, productImages.signatureWhite, [productImages.signatureWhite, productImages.whiteBack]),
      colorVariant('Preto', productImages.signatureBlack, productImages.signatureBlackCutout, [productImages.signatureBlack, productImages.blackBack]),
      colorVariant('Marrom', productImages.signatureBrown, productImages.signatureBrownCutout, [productImages.signatureBrown, productImages.hybridBrownBack]),
    ],
    sizes: defaultSizes,
    active: true,
    image: productImages.signatureWhite,
    heroImage: productImages.signatureBlackCutout,
    gallery: [productImages.signatureWhite, productImages.signatureBlack, productImages.signatureBrown],
    description: 'Linha assinatura com aplicação sutil da marca. A cor escolhida atualiza a foto do produto antes de adicionar ao carrinho.',
  },
  {
    id: 'selecao-art-kit-3',
    name: 'Seleção Art Kit 3 Camisetas',
    line: 'Kit especial',
    price: 114.9,
    installment: '2x de R$57,45 sem juros',
    category: 'Kit',
    categories: ['Kit'],
    colors: [
      colorVariant('Mix de cores', productImages.hybridBlack, productImages.hybridBlackCutout, [productImages.hybridBlack, productImages.hybridBrown, productImages.hybridWhiteCenter]),
      colorVariant('Branco/off-white', productImages.hybridWhiteCenter, productImages.hybridWhiteCenter, [productImages.hybridWhiteCenter, productImages.hybridWhite, productImages.whiteBack]),
      colorVariant('Marrom', productImages.hybridBrown, productImages.hybridBrownCutout, [productImages.hybridBrown, productImages.hybridBrownAlt, productImages.hybridBrownBack]),
    ],
    sizes: defaultSizes,
    active: true,
    image: productImages.hybridBlack,
    heroImage: productImages.hybridBlackCutout,
    gallery: [productImages.hybridBlack, productImages.hybridBrown, productImages.hybridWhiteCenter],
    description: 'Kit para experimentar a marca com mais possibilidades de uso no dia a dia.',
  },
];

const shippingOptions = [
  { id: 'retirada-art', name: 'Retirada ART', detail: 'Retirada combinada com a loja', price: 0 },
  { id: 'sedex-promocional', name: 'Correios SEDEX Promocional', detail: 'Envio a domicílio', price: 29.63 },
  { id: 'jadlog-package', name: 'Jadlog Package Promocional', detail: 'Envio a domicílio', price: 35.95 },
  { id: 'pac-promocional', name: 'Correios PAC Promocional', detail: 'Envio a domicílio', price: 41.83 },
  { id: 'pac-economico', name: 'Correios PAC Econômico', detail: 'Envio a domicílio', price: 42.17 },
  { id: 'jadlog-rapido', name: 'Jadlog Rápido', detail: 'Envio a domicílio', price: 45.04 },
  { id: 'sedex-padrao', name: 'Correios SEDEX', detail: 'Envio a domicílio', price: 50 },
  { id: 'jadlog-economico', name: 'Jadlog Econômico', detail: 'Envio a domicílio', price: 57.63 },
];

const paymentMethods = [
  { id: 'pix', name: 'Pix', detail: 'Pagamento rápido combinado no atendimento' },
  { id: 'credito', name: 'Cartão de crédito', detail: 'Visa, Mastercard, Elo, Hipercard, American Express e outros' },
  { id: 'boleto', name: 'Boleto bancário', detail: 'Dados enviados pela loja após a conferência' },
  { id: 'mercado-pago', name: 'Mercado Pago', detail: 'Carteira digital e meios parceiros' },
  { id: 'linha-credito', name: 'Linha de Crédito Mercado Pago', detail: 'Sujeito à aprovação do provedor' },
];

const paymentSeals = [
  { id: 'visa', label: 'Visa' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'amex', label: 'American Express' },
  { id: 'diners', label: 'Diners Club' },
  { id: 'aura', label: 'Aura' },
  { id: 'bradesco', label: 'Bradesco' },
  { id: 'elo', label: 'Elo' },
  { id: 'hipercard', label: 'Hipercard' },
  { id: 'pix', label: 'Pix' },
  { id: 'discover', label: 'Discover' },
  { id: 'boleto', label: 'Boleto' },
  { id: 'mercado-pago', label: 'Mercado Pago' },
];

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function safeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local persistence is helpful, but the storefront must continue working if storage is unavailable.
  }
}

function parseList(value) {
  return String(value || '')
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseColors(value) {
  const names = parseList(value);
  return (names.length ? names : defaultColors.map((color) => color.name)).map((name) => ({
    name,
    value: colorLibrary[name] || '#111111',
  }));
}

function normalizeProduct(product) {
  const image = product.image || productImages.hybridBrown;
  const colors = Array.isArray(product.colors) && product.colors.length ? product.colors : defaultColors;
  const gallery = Array.isArray(product.gallery) && product.gallery.length ? product.gallery : [image];
  return {
    ...product,
    line: product.line || 'use.a.r.t',
    price: Number(product.price) || 0,
    installment: product.installment || 'Consulte parcelas',
    category: product.category || 'Unissex',
    categories: Array.isArray(product.categories) && product.categories.length
      ? product.categories
      : [product.category || 'Unissex'],
    colors,
    sizes: Array.isArray(product.sizes) && product.sizes.length ? product.sizes : defaultSizes,
    active: product.active !== false,
    image,
    heroImage: product.heroImage || colors.find((color) => color.cutout)?.cutout || image,
    gallery,
    description: product.description || 'Produto use.a.r.t com proposta minimalista, confortável e versátil.',
  };
}

function loadProducts() {
  const saved = readStorage(storageKeys.products, null);
  const source = Array.isArray(saved) && saved.length ? saved : defaultProducts;
  return source.map(normalizeProduct);
}

function saveProducts(products) {
  writeStorage(storageKeys.products, products);
}

function loadCart() {
  const saved = readStorage(storageKeys.cart, []);
  if (!Array.isArray(saved)) return [];

  return saved
    .map((item) => {
      if (!item?.product) return null;
      const product = normalizeProduct(item.product);
      const color = typeof item.color === 'string'
        ? { name: item.color, value: colorLibrary[item.color] || '#111111' }
        : item.color || product.colors[0];
      const size = item.size || product.sizes[0];
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const key = item.key || `${product.id}-${color?.name || 'sem-cor'}-${size || 'sem-tamanho'}`;
      const image = item.image || imageForColor(product, color);
      return { key, product, color, size, quantity, image };
    })
    .filter(Boolean);
}

function imageForColor(product, color) {
  if (!product) return '';
  const selected = color?.name
    ? product.colors?.find((item) => item.name === color.name)
    : null;
  return selected?.image || product.image;
}

function cutoutForColor(product, colorName) {
  const selected = colorName
    ? product?.colors?.find((item) => item.name === colorName)
    : product?.colors?.find((item) => item.cutout);
  return selected?.cutout || selected?.image || product?.heroImage || product?.image;
}

function galleryForColor(product, color) {
  const selected = color?.name
    ? product.colors?.find((item) => item.name === color.name)
    : null;
  const first = imageForColor(product, color);
  const gallery = selected?.gallery?.length ? selected.gallery : product.gallery;
  return Array.from(new Set([first, ...(gallery || [])])).filter(Boolean);
}

function categoryLabel(product) {
  if (product.category === 'Kit') return 'Kit';
  if (product.categories?.includes('Masculino') && product.categories?.includes('Feminino')) return 'Unissex';
  return product.category || product.categories?.[0] || 'Unissex';
}

function matchesCategory(product, filter) {
  if (filter === 'Todos') return true;
  return product.category === filter || product.categories?.includes(filter);
}

function formatOrderDate(date) {
  return date.toLocaleDateString('pt-BR');
}

function buildOrderId(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `USEART-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function buildWhatsAppMessage(order) {
  const addressLines = order.shipping.id === 'retirada-art'
    ? ['Retirada ART: combinar horário e local no atendimento.']
    : [
        `CEP: ${order.address.cep}`,
        `Rua: ${order.address.street}, ${order.address.number}`,
        `Complemento: ${order.address.complement || '-'}`,
        `Bairro: ${order.address.district}`,
        `Cidade/UF: ${order.address.city} - ${order.address.state}`,
      ];

  const itemLines = order.items.flatMap((item, index) => [
    `${index + 1}. ${item.quantity}x ${item.product.name}`,
    `Cor: ${item.color.name}`,
    `Tamanho: ${item.size}`,
    `Valor unitário: ${money(item.product.price)}`,
    `Subtotal: ${money(item.product.price * item.quantity)}`,
    '',
  ]);

  return [
    'Olá! Quero finalizar um pedido na use.a.r.t.',
    '',
    `Pedido: ${order.id}`,
    `Data: ${formatOrderDate(new Date(order.createdAt))}`,
    '',
    'Cliente:',
    `Nome: ${order.customer.name}`,
    `WhatsApp: ${order.customer.phone}`,
    `E-mail: ${order.customer.email}`,
    '',
    'Entrega:',
    `Método: ${order.shipping.name}`,
    `Frete: ${money(order.shipping.price)}`,
    '',
    'Endereço:',
    ...addressLines,
    '',
    'Itens:',
    ...itemLines,
    'Pagamento:',
    order.payment.name,
    '',
    'Resumo:',
    `Subtotal produtos: ${money(order.subtotal)}`,
    `Frete: ${money(order.shipping.price)}`,
    `Total: ${money(order.total)}`,
    '',
    'Aguardo confirmação para pagamento e envio.',
  ].join('\n');
}

function buildWhatsAppUrl(order) {
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
}

function saveOrder(order) {
  const current = readStorage(storageKeys.orders, []);
  const next = [order, ...(Array.isArray(current) ? current : [])].slice(0, 20);
  writeStorage(storageKeys.orders, next);
}

function Icon({ name }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true };
  if (name === 'bag') return <svg {...props}><path d="M6.5 8h11l-.8 12H7.3L6.5 8Z" stroke="currentColor" strokeWidth="1.8" /><path d="M9 9V7.3C9 5.5 10.3 4 12 4s3 1.5 3 3.3V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'user') return <svg {...props}><circle cx="12" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.8" /><path d="M6.8 19c.9-2.1 2.8-3.4 5.2-3.4s4.3 1.3 5.2 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'search') return <svg {...props}><circle cx="10.8" cy="10.8" r="5.8" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'arrow') return <svg {...props}><path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === 'x') return <svg {...props}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'trash') return <svg {...props}><path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === 'minus') return <svg {...props}><path d="M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'plus') return <svg {...props}><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  return null;
}

function Logo({ className = '' }) {
  return <img className={`logo ${className}`} src="/assets/use-art-logo.jpg" alt="use.a.r.t" />;
}

function PaymentSeal({ method }) {
  if (method.id === 'visa') {
    return <span className="payment-seal payment-visa" title={method.label} aria-label={method.label}>VISA</span>;
  }

  if (method.id === 'mastercard') {
    return (
      <span className="payment-seal payment-mastercard" title={method.label} aria-label={method.label}>
        <i /><b>mastercard</b>
      </span>
    );
  }

  if (method.id === 'amex') {
    return <span className="payment-seal payment-amex" title={method.label} aria-label={method.label}>AMEX</span>;
  }

  if (method.id === 'diners') {
    return (
      <span className="payment-seal payment-diners" title={method.label} aria-label={method.label}>
        <i /><b>Diners Club</b>
      </span>
    );
  }

  if (method.id === 'aura') {
    return <span className="payment-seal payment-aura" title={method.label} aria-label={method.label}>Aura</span>;
  }

  if (method.id === 'bradesco') {
    return (
      <span className="payment-seal payment-bradesco" title={method.label} aria-label={method.label}>
        <i />Bradesco
      </span>
    );
  }

  if (method.id === 'elo') {
    return (
      <span className="payment-seal payment-elo" title={method.label} aria-label={method.label}>
        <i /><b>elo</b>
      </span>
    );
  }

  if (method.id === 'hipercard') {
    return <span className="payment-seal payment-hipercard" title={method.label} aria-label={method.label}>Hipercard</span>;
  }

  if (method.id === 'pix') {
    return (
      <span className="payment-seal payment-pix" title={method.label} aria-label={method.label}>
        <svg viewBox="0 0 36 24" aria-hidden="true">
          <path d="M18 3.5 25.5 11c.8.8.8 2.2 0 3L18 21.5 10.5 14a2.1 2.1 0 0 1 0-3L18 3.5Z" fill="currentColor" />
          <path d="m18 8 4 4-4 4-4-4 4-4Z" fill="#fff" />
        </svg>
        Pix
      </span>
    );
  }

  if (method.id === 'discover') {
    return <span className="payment-seal payment-discover" title={method.label} aria-label={method.label}>Discover</span>;
  }

  if (method.id === 'boleto') {
    return (
      <span className="payment-seal payment-boleto" title={method.label} aria-label={method.label}>
        <i />Boleto
      </span>
    );
  }

  return (
    <span className="payment-seal payment-mercado-pago" title={method.label} aria-label={method.label}>
      <i>mp</i><b>Mercado Pago</b>
    </span>
  );
}

function Header({ cartCount, onCartClick, onAdminClick, search, onSearchChange }) {
  function handleSubmit(event) {
    event.preventDefault();
    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <header className="site-header">
      <div className="top-promo" aria-label="Cupom de primeira compra">
        <span>10% de desconto com o cupom: PRIMEIRACOMPRA</span>
        <span>10% de desconto com o cupom: PRIMEIRACOMPRA</span>
        <span>10% de desconto com o cupom: PRIMEIRACOMPRA</span>
      </div>
      <div className="header-inner">
        <div className="header-left">
          <a href="#inicio" className="header-logo" aria-label="Voltar ao início"><Logo /></a>
          <nav>
            <a href="#inicio">Início</a>
            <a href="#produtos">Produtos</a>
            <a href="#contato">Contato</a>
          </nav>
        </div>
        <div className="header-actions">
          <form className="header-search" onSubmit={handleSubmit}>
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar camiseta"
              aria-label="Buscar produtos"
            />
          </form>
          <a href="#produtos" className="cart-pill">Comprar</a>
          <button className="icon-button cart-button" type="button" aria-label="Abrir carrinho" onClick={onCartClick}>
            <Icon name="bag" />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
          <button className="icon-button" type="button" aria-label="Abrir admin" onClick={onAdminClick}><Icon name="user" /></button>
        </div>
      </div>
    </header>
  );
}

function Hero({ products }) {
  const main = products.find((item) => item.id === 'camiseta-hybrid-art') || products[0];
  const secondary = products.find((item) => item.id === 'camiseta-hybrid') || products[1] || main;
  const tertiary = products.find((item) => item.id === 'camiseta-solid-assinatura') || products[2] || main;

  return (
    <section id="inicio" className="hero-section">
      <div className="hero-brand-watermark" aria-hidden="true">
        <Logo />
        <span>use.a.r.t</span>
      </div>
      <div className="hero-product-stage" aria-hidden="true">
        <img className="hero-shirt hero-shirt-secondary" src={cutoutForColor(secondary, 'Preto') || productImages.hybridBlackCutout} alt="" />
        <img className="hero-shirt hero-shirt-main" src={cutoutForColor(main, 'Marrom') || productImages.hybridBrownCutout} alt="" />
        <img className="hero-shirt hero-shirt-tertiary" src={cutoutForColor(tertiary, 'Preto') || productImages.signatureBlackCutout} alt="" />
      </div>
      <div className="hero-overlay">
        <p>use.a.r.t / streetwear minimalista</p>
        <h1>Vista seu movimento</h1>
        <span>Camisetas minimalistas para quem busca conforto, presença e identidade na rotina.</span>
        <div className="hero-actions">
          <a href="#produtos" className="hero-button primary">Ver produtos</a>
          <a href="#produtos" className="hero-button secondary">Comprar agora</a>
        </div>
        <div className="hero-meta" aria-label="Destaques da loja">
          <span>Art | Conforto em movimento</span>
          <span>PP ao XG</span>
          <span>Retirada ART</span>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onOpen }) {
  const [previewColor, setPreviewColor] = useState(product.colors?.[0] || null);
  const previewImage = imageForColor(product, previewColor);

  function openProduct() {
    onOpen(product);
  }

  function choosePreviewColor(event, color) {
    event.stopPropagation();
    setPreviewColor(color);
  }

  return (
    <article
      className="product-card"
      onClick={openProduct}
      onKeyDown={(event) => event.key === 'Enter' && openProduct()}
      tabIndex="0"
    >
      <div className="product-image">
        <span className="product-watermark" aria-hidden="true">use.a.r.t</span>
        <img src={previewImage} alt={product.name} />
        {product.category === 'Kit' && <span className="product-badge">Kit</span>}
      </div>
      <div className="product-info">
        <p>{product.line} / {categoryLabel(product)}</p>
        <div className="product-title-row">
          <h3>{product.name}</h3>
          <strong>{money(product.price)}</strong>
        </div>
        <small>{product.installment}</small>
        <div className="card-bottom">
          <div className="color-dots" aria-label="Cores disponíveis">
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                className={previewColor?.name === color.name ? 'active' : ''}
                style={{ background: color.value }}
                title={color.name}
                aria-label={`Ver ${product.name} na cor ${color.name}`}
                onClick={(event) => choosePreviewColor(event, color)}
              />
            ))}
          </div>
          <button type="button">Ver produto</button>
        </div>
      </div>
    </article>
  );
}

function ProductsSection({ products, query, onQueryChange, onOpen }) {
  const [filter, setFilter] = useState('Todos');
  const [sort, setSort] = useState('az');
  const filters = ['Todos', 'Masculino', 'Feminino', 'Unissex', 'Kit'];

  const visible = useMemo(() => {
    return products
      .filter((product) => product.active !== false)
      .filter((product) => matchesCategory(product, filter))
      .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, filter, query, sort]);

  return (
    <section id="produtos" className="products-section">
      <div className="catalog-top">
        <div>
          <p>Catálogo use.a.r.t</p>
          <h2>Produtos</h2>
          <span className="catalog-subtitle">Peças reais da marca, com cor, tamanho e pedido direto pelo WhatsApp.</span>
          <div className="category-tabs">
            {filters.map((item) => (
              <button key={item} type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="catalog-controls">
          <label className="search">
            <Icon name="search" />
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar por nome" />
          </label>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar produtos">
            <option value="az">A-Z</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select>
        </div>
      </div>
      {visible.length ? (
        <div className="product-grid">
          {visible.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} />)}
        </div>
      ) : (
        <div className="empty-state">Nenhum produto encontrado.</div>
      )}
    </section>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  const [image, setImage] = useState(imageForColor(product, null));
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  if (!product) return null;
  const activeGallery = galleryForColor(product, color);

  function changeQuantity(nextQuantity) {
    setQuantity(Math.max(1, Number(nextQuantity) || 1));
  }

  function submit() {
    if (product.colors?.length && !color) {
      setError('Escolha uma cor para continuar.');
      return;
    }
    if (product.sizes?.length && !size) {
      setError('Escolha um tamanho para continuar.');
      return;
    }
    onAddToCart(product, color, size, quantity);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        <div className="detail-image">
          <img src={image} alt={product.name} />
          <div className="thumb-row">
            {activeGallery.map((item) => (
              <button key={item} type="button" className={image === item ? 'active' : ''} onClick={() => setImage(item)}>
                <img src={item} alt="Miniatura do produto" />
              </button>
            ))}
          </div>
        </div>
        <div className="detail-content">
          <p className="product-line-label">{product.line}</p>
          <h2>{product.name}</h2>
          <strong>{money(product.price)}</strong>
          <small className="installment-line">{product.installment}</small>
          <p className="detail-description">{product.description}</p>

          <p className="option-label">Cor</p>
          <div className="color-options">
            {product.colors.map((item) => (
              <button
                key={item.name}
                type="button"
                title={item.name}
                aria-label={`Selecionar cor ${item.name}`}
                className={color?.name === item.name ? 'active' : ''}
                style={{ background: item.value }}
                onClick={() => { setColor(item); setImage(imageForColor(product, item)); setError(''); }}
              />
            ))}
          </div>

          <p className="option-label">Tamanho</p>
          <div className="size-grid detail-sizes">
            {product.sizes.map((item) => (
              <button key={item} type="button" className={size === item ? 'active' : ''} onClick={() => { setSize(item); setError(''); }}>
                {item}
              </button>
            ))}
          </div>

          <p className="option-label">Quantidade</p>
          <div className="quantity-box quantity-large">
            <button type="button" onClick={() => changeQuantity(quantity - 1)} disabled={quantity <= 1}><Icon name="minus" /></button>
            <span>{quantity}</span>
            <button type="button" onClick={() => changeQuantity(quantity + 1)}><Icon name="plus" /></button>
          </div>

          <div className="selected-summary">
            {color ? <i style={{ background: color.value }} /> : <i />}
            {color?.name || 'Selecione a cor'} / {size || 'Selecione o tamanho'}
          </div>

          {error && <div className="form-error">{error}</div>}
          <button className="primary-link full" type="button" onClick={submit}>
            Adicionar ao carrinho <Icon name="arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onRemove, onClear, onUpdateQuantity, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <p>use.a.r.t</p>
            <h2>Carrinho</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart"><p>Seu carrinho está vazio.</p><a href="#produtos" onClick={onClose}>Ver produtos</a></div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.key}>
                  <img src={item.image || imageForColor(item.product, item.color)} alt={item.product.name} />
                  <div>
                    <strong>{item.product.name}</strong>
                    <span>{item.color.name} / {item.size}</span>
                    <p>{money(item.product.price)}</p>
                    <div className="quantity-box">
                      <button type="button" onClick={() => onUpdateQuantity(item.key, item.quantity - 1)} disabled={item.quantity <= 1}><Icon name="minus" /></button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}><Icon name="plus" /></button>
                    </div>
                  </div>
                  <button className="remove-item" type="button" onClick={() => onRemove(item.key)} aria-label="Remover"><Icon name="trash" /></button>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <button className="primary-link full" type="button" onClick={onCheckout}>Finalizar pedido</button>
            <button className="secondary-link full" type="button" onClick={onClear}>Limpar carrinho</button>
          </>
        )}
      </aside>
    </div>
  );
}

function CheckoutModal({ cart, onClose, onBackToCart, onFinish }) {
  const [step, setStep] = useState('contact');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [address, setAddress] = useState({ cep: '', street: '', number: '', complement: '', district: '', city: '', state: 'MS' });
  const [shipping, setShipping] = useState(shippingOptions[0]);
  const [payment, setPayment] = useState(paymentMethods[0]);
  const [errors, setErrors] = useState({});
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + shipping.price;
  const needsAddress = shipping.id !== 'retirada-art';
  const steps = [
    { id: 'contact', label: 'Contato' },
    { id: 'shipping', label: 'Entrega' },
    { id: 'payment', label: 'Pagamento' },
    { id: 'review', label: 'Revisão' },
  ];

  function updateCustomer(field, value) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  function validateContact() {
    const nextErrors = {};
    if (!customer.name.trim()) nextErrors.name = 'Informe seu nome completo.';
    if (!customer.phone.trim()) nextErrors.phone = 'Informe seu WhatsApp ou telefone.';
    if (!customer.email.trim()) nextErrors.email = 'Informe seu e-mail.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateShipping() {
    const nextErrors = {};
    if (needsAddress) {
      if (!address.cep.trim()) nextErrors.cep = 'Informe o CEP.';
      if (!address.street.trim()) nextErrors.street = 'Informe a rua.';
      if (!address.number.trim()) nextErrors.number = 'Informe o número.';
      if (!address.district.trim()) nextErrors.district = 'Informe o bairro.';
      if (!address.city.trim()) nextErrors.city = 'Informe a cidade.';
      if (!address.state.trim()) nextErrors.state = 'Informe o estado.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goToShipping() {
    if (validateContact()) setStep('shipping');
  }

  function goToPayment() {
    if (validateShipping()) setStep('payment');
  }

  function finish() {
    onFinish({ customer, address, shipping, payment, subtotal, total });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="checkout-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        <div className="checkout-main">
          <button className="back-link" type="button" onClick={onBackToCart}>Voltar para o carrinho</button>
          <h2>Checkout</h2>
          <div className="checkout-steps">
            {steps.map((item) => <span key={item.id} className={step === item.id ? 'active' : ''}>{item.label}</span>)}
          </div>

          {step === 'contact' && (
            <div className="checkout-panel">
              <h3>Contato</h3>
              <input placeholder="Nome completo" value={customer.name} onChange={(event) => updateCustomer('name', event.target.value)} />
              {errors.name && <div className="field-error">{errors.name}</div>}
              <input placeholder="WhatsApp / telefone" value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} />
              {errors.phone && <div className="field-error">{errors.phone}</div>}
              <input placeholder="E-mail" value={customer.email} onChange={(event) => updateCustomer('email', event.target.value)} />
              {errors.email && <div className="field-error">{errors.email}</div>}
              <button className="primary-link full" type="button" onClick={goToShipping}>Ir para entrega <Icon name="arrow" /></button>
            </div>
          )}

          {step === 'shipping' && (
            <div className="checkout-panel">
              <h3>Entrega</h3>
              <div className="option-list">
                {shippingOptions.map((option) => (
                  <button key={option.id} type="button" className={shipping.id === option.id ? 'selected' : ''} onClick={() => { setShipping(option); setErrors({}); }}>
                    <span><strong>{option.name}</strong><small>{option.detail}</small></span>
                    <b>{option.price === 0 ? 'Grátis' : money(option.price)}</b>
                  </button>
                ))}
              </div>
              <p className="checkout-note">O valor do frete entra no total e pode ser conferido com a loja antes do envio.</p>
              {needsAddress ? (
                <>
                  <h3>Endereço</h3>
                  <div className="form-grid two">
                    <label><input placeholder="CEP" value={address.cep} onChange={(event) => updateAddress('cep', event.target.value)} />{errors.cep && <small>{errors.cep}</small>}</label>
                    <label><input placeholder="Estado" value={address.state} onChange={(event) => updateAddress('state', event.target.value.toUpperCase())} />{errors.state && <small>{errors.state}</small>}</label>
                  </div>
                  <div className="form-grid two">
                    <label><input placeholder="Rua" value={address.street} onChange={(event) => updateAddress('street', event.target.value)} />{errors.street && <small>{errors.street}</small>}</label>
                    <label><input placeholder="Número" value={address.number} onChange={(event) => updateAddress('number', event.target.value)} />{errors.number && <small>{errors.number}</small>}</label>
                  </div>
                  <input placeholder="Complemento" value={address.complement} onChange={(event) => updateAddress('complement', event.target.value)} />
                  <div className="form-grid two">
                    <label><input placeholder="Bairro" value={address.district} onChange={(event) => updateAddress('district', event.target.value)} />{errors.district && <small>{errors.district}</small>}</label>
                    <label><input placeholder="Cidade" value={address.city} onChange={(event) => updateAddress('city', event.target.value)} />{errors.city && <small>{errors.city}</small>}</label>
                  </div>
                </>
              ) : (
                <div className="pickup-box">Retirada combinada diretamente pelo WhatsApp da loja.</div>
              )}
              <div className="checkout-actions">
                <button className="secondary-link" type="button" onClick={() => setStep('contact')}>Voltar</button>
                <button className="primary-link" type="button" onClick={goToPayment}>Ir para pagamento <Icon name="arrow" /></button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="checkout-panel">
              <h3>Forma de pagamento</h3>
              <div className="option-list payment-list">
                {paymentMethods.map((method) => (
                  <button key={method.id} type="button" className={payment.id === method.id ? 'selected' : ''} onClick={() => setPayment(method)}>
                    <span><strong>{method.name}</strong><small>{method.detail}</small></span>
                    <i>›</i>
                  </button>
                ))}
              </div>
              <p className="checkout-note">A loja confirma os dados do pedido e segue com a cobrança pelo atendimento.</p>
              <div className="checkout-actions">
                <button className="secondary-link" type="button" onClick={() => setStep('shipping')}>Voltar</button>
                <button className="primary-link" type="button" onClick={() => setStep('review')}>Revisar pedido <Icon name="arrow" /></button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="checkout-panel review-panel">
              <h3>Revise seu pedido</h3>
              <div className="review-block">
                <strong>Cliente</strong>
                <p>{customer.name}</p>
                <p>{customer.phone}</p>
                <p>{customer.email}</p>
              </div>
              <div className="review-block">
                <strong>Entrega</strong>
                <p>{shipping.name} - {shipping.price === 0 ? 'Grátis' : money(shipping.price)}</p>
                {needsAddress ? (
                  <p>{address.street}, {address.number} - {address.district}, {address.city}/{address.state}</p>
                ) : (
                  <p>Retirada ART combinada no atendimento.</p>
                )}
              </div>
              <div className="review-block">
                <strong>Pagamento</strong>
                <p>{payment.name}</p>
              </div>
              <div className="checkout-actions">
                <button className="secondary-link" type="button" onClick={() => setStep('payment')}>Voltar</button>
                <button className="primary-link" type="button" onClick={finish}>Finalizar pedido pelo WhatsApp</button>
              </div>
            </div>
          )}
        </div>

        <aside className="order-summary">
          <h3>Seu pedido</h3>
          {cart.map((item) => (
            <div className="summary-item" key={item.key}>
              <img src={item.image || imageForColor(item.product, item.color)} alt={item.product.name} />
              <div><strong>{item.product.name}</strong><span>{item.color.name} / {item.size} x {item.quantity}</span></div>
              <b>{money(item.product.price * item.quantity)}</b>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <div className="summary-row"><span>Frete</span><b>{shipping.price === 0 ? 'Grátis' : money(shipping.price)}</b></div>
          <div className="summary-total"><span>Total</span><b>{money(total)}</b></div>
        </aside>
      </div>
    </div>
  );
}

function SuccessModal({ order, onClose }) {
  if (!order) return null;

  function openWhatsApp() {
    window.open(order.whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="success-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        <Logo />
        <p>Pedido enviado para WhatsApp</p>
        <h2>Obrigado por comprar na use.a.r.t</h2>
        <span>Pedido: {order.id}</span>
        <span>Entrega: {order.shipping.name}</span>
        <span>Pagamento: {order.payment.name}</span>
        <strong>Total: {money(order.total)}</strong>
        <button className="primary-link full" type="button" onClick={openWhatsApp}>Abrir WhatsApp novamente</button>
        <button className="secondary-link full" type="button" onClick={onClose}>Continuar comprando</button>
      </div>
    </div>
  );
}

function emptyAdminForm() {
  return {
    name: '',
    line: '',
    price: '',
    installment: '',
    category: 'Masculino',
    colors: 'Branco/off-white, Preto, Marrom',
    sizes: 'PP, P, M, G, GG, XG',
    description: '',
    image: productImages.hybridBrown,
    active: true,
  };
}

function AdminModal({ products, setProducts, onClose }) {
  const [logged, setLogged] = useState(false);
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(emptyAdminForm);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  function resetForm() {
    setForm(emptyAdminForm());
    setPreview(null);
    setEditingId(null);
    setFormError('');
  }

  function saveProduct() {
    if (!form.name.trim() || !form.price) {
      setFormError('Informe nome e preço para salvar o produto.');
      return;
    }

    const previous = products.find((product) => product.id === editingId);
    const image = preview || form.image || previous?.image || productImages.hybridBrown;
    const product = normalizeProduct({
      id: editingId || safeId(),
      name: form.name.trim(),
      line: form.line.trim() || 'Nova peça',
      price: Number(String(form.price).replace(',', '.')) || 0,
      installment: form.installment.trim() || 'Consulte parcelas',
      category: form.category,
      colors: parseColors(form.colors),
      sizes: parseList(form.sizes).length ? parseList(form.sizes) : defaultSizes,
      active: form.active,
      image,
      gallery: preview ? [image] : previous?.gallery?.length ? previous.gallery : [image],
      description: form.description.trim() || 'Produto use.a.r.t cadastrado no painel local.',
    });

    const next = editingId
      ? products.map((item) => (item.id === editingId ? product : item))
      : [...products, product];

    setProducts(next);
    saveProducts(next);
    resetForm();
  }

  function startEdit(product) {
    setEditingId(product.id);
    setPreview(null);
    setForm({
      name: product.name,
      line: product.line,
      price: String(product.price).replace('.', ','),
      installment: product.installment,
      category: product.category,
      colors: product.colors.map((color) => color.name).join(', '),
      sizes: product.sizes.join(', '),
      description: product.description,
      image: product.image,
      active: product.active !== false,
    });
  }

  function removeProduct(id) {
    const next = products.filter((product) => product.id !== id);
    setProducts(next);
    saveProducts(next);
  }

  function toggleProduct(id) {
    const next = products.map((product) => (product.id === id ? { ...product, active: product.active === false } : product));
    setProducts(next);
    saveProducts(next);
  }

  function restore() {
    setProducts(defaultProducts);
    saveProducts(defaultProducts);
    resetForm();
  }

  function handleUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}><Icon name="x" /></button>
        {!logged ? (
          <div className="admin-login">
            <h2>Admin local</h2>
            <p>Controle básico do catálogo salvo neste navegador. A senha local está no README do projeto.</p>
            <input type="password" value={password} placeholder="Senha" onChange={(event) => setPassword(event.target.value)} />
            <button className="primary-link" type="button" onClick={() => setLogged(password === ADMIN_PASSWORD)}>Entrar</button>
          </div>
        ) : (
          <div className="admin-grid">
            <div className="admin-form">
              <h2>{editingId ? 'Editar produto' : 'Novo produto'}</h2>
              <input placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <input placeholder="Linha" value={form.line} onChange={(event) => setForm({ ...form, line: event.target.value })} />
              <input placeholder="Preço" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
              <input placeholder="Parcelamento" value={form.installment} onChange={(event) => setForm({ ...form, installment: event.target.value })} />
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Unissex</option>
                <option>Kit</option>
              </select>
              <input placeholder="Cores disponíveis" value={form.colors} onChange={(event) => setForm({ ...form, colors: event.target.value })} />
              <input placeholder="Tamanhos disponíveis" value={form.sizes} onChange={(event) => setForm({ ...form, sizes: event.target.value })} />
              <textarea placeholder="Descrição curta" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              <label className="check-field">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                Produto ativo na loja
              </label>
              <label className="file-field">Enviar imagem<input type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0])} /></label>
              {(preview || form.image) && <div className="admin-preview"><img src={preview || form.image} alt="Prévia" /></div>}
              {formError && <div className="form-error">{formError}</div>}
              <button className="primary-link full" type="button" onClick={saveProduct}>{editingId ? 'Salvar alterações' : 'Adicionar produto'}</button>
              {editingId && <button className="secondary-link full" type="button" onClick={resetForm}>Cancelar edição</button>}
              <button className="secondary-link full" type="button" onClick={restore}>Restaurar catálogo padrão</button>
            </div>
            <div className="admin-list">
              <h2>Produtos</h2>
              {products.map((product) => (
                <div className="admin-item" key={product.id}>
                  <img src={product.image} alt={product.name} />
                  <div>
                    <span>{product.name}</span>
                    <strong>{money(product.price)}</strong>
                    <small>{product.active === false ? 'Inativo' : 'Ativo'}</small>
                  </div>
                  <div className="admin-actions">
                    <button type="button" onClick={() => startEdit(product)}>Editar</button>
                    <button type="button" onClick={() => toggleProduct(product.id)}>{product.active === false ? 'Ativar' : 'Inativar'}</button>
                    <button type="button" onClick={() => removeProduct(product.id)}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer id="contato">
      <div className="footer-top">
        <div className="footer-brand">
          <Logo />
          <div>
            <strong>use.a.r.t</strong>
            <p>Art | Conforto em movimento</p>
          </div>
        </div>
        <div className="footer-menu">
          <a href="#inicio">Início</a>
          <a href="#produtos">Produtos</a>
          <a href={`https://wa.me/${STORE_WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="https://www.instagram.com/use.a.r.t/" target="_blank" rel="noreferrer">Instagram</a>
        </div>
        <div className="footer-info">
          <strong>Atendimento</strong>
          <p>WhatsApp: +55 67 9169-1441</p>
          <p>Campo Grande - MS</p>
          <p>Retirada ART e envios por Correios/Jadlog</p>
          <p>Compra conferida no atendimento antes do pagamento.</p>
        </div>
      </div>
      <div className="payment-seals" aria-label="Formas de pagamento aceitas">
        {paymentSeals.map((method) => <PaymentSeal key={method.id} method={method} />)}
      </div>
      <p className="copyright">Copyright ART - 54410257000140 - 2026. Todos os direitos reservados.</p>
    </footer>
  );
}

function App() {
  const [products, setProducts] = useState(loadProducts);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [productQuery, setProductQuery] = useState('');
  const activeProducts = useMemo(() => products.filter((product) => product.active !== false), [products]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    writeStorage(storageKeys.cart, cart);
  }, [cart]);

  function addToCart(product, color, size, quantity = 1) {
    const finalQuantity = Math.max(1, Number(quantity) || 1);
    const key = `${product.id}-${color?.name || 'sem-cor'}-${size || 'sem-tamanho'}`;
    const image = imageForColor(product, color);
    setCart((current) => {
      const found = current.find((item) => item.key === key);
      if (found) {
        return current.map((item) => (item.key === key ? { ...item, image, quantity: item.quantity + finalQuantity } : item));
      }
      return [...current, { key, product, color, size, quantity: finalQuantity, image }];
    });
    setCartOpen(true);
  }

  function updateQuantity(key, quantity) {
    setCart((current) => current.map((item) => (item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item)));
  }

  function finishOrder(orderDraft) {
    if (!cart.length) return;
    const createdAt = new Date();
    const order = {
      ...orderDraft,
      id: buildOrderId(createdAt),
      createdAt: createdAt.toISOString(),
      items: cart,
    };
    const whatsappUrl = buildWhatsAppUrl(order);
    const finalOrder = { ...order, whatsappUrl };

    saveOrder(finalOrder);
    setCheckoutOpen(false);
    setCart([]);
    setSuccessOrder(finalOrder);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="page-shell">
      <Header
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onAdminClick={() => setAdminOpen(true)}
        search={productQuery}
        onSearchChange={setProductQuery}
      />
      <Hero products={activeProducts} />
      <ProductsSection products={products} query={productQuery} onQueryChange={setProductQuery} onOpen={setSelected} />
      <Footer />
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAddToCart={addToCart} />}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={(key) => setCart((current) => current.filter((item) => item.key !== key))}
          onClear={() => setCart([])}
          onUpdateQuantity={updateQuantity}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        />
      )}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          onClose={() => setCheckoutOpen(false)}
          onBackToCart={() => { setCheckoutOpen(false); setCartOpen(true); }}
          onFinish={finishOrder}
        />
      )}
      {adminOpen && <AdminModal products={products} setProducts={setProducts} onClose={() => setAdminOpen(false)} />}
      {successOrder && <SuccessModal order={successOrder} onClose={() => setSuccessOrder(null)} />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
