export const STORE_CONFIG = {
  brandName: 'ART',
  handle: '@use.a.r.t',
  slogan: 'Conforto em movimento',
  cnpj: '54.410.257/0001-40',
  location: 'Campo Grande/MS',
  whatsappDisplay: '+55 67 99169-1441',
  whatsappNumber: '5567991691441',
  instagramUrl: 'https://www.instagram.com/use.a.r.t/',
  logo: {
    dark: '/assets/use-art-logo-black.png',
    photo: '/assets/use-art-logo.jpg',
  },
} as const;

export const FUTURE_CONTRACTS = {
  admin: 'Supabase Auth, Postgres e Storage na Fase 2.',
  payment: 'Mercado Pago Checkout Pro somente quando houver credenciais reais.',
  shipping: 'ShippingQuoteProvider preparado sem integração falsa.',
} as const;
