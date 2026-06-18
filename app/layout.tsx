import type { Metadata } from 'next';
import './globals.css';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { STORE_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL('https://useart.local'),
  title: {
    default: `${STORE_CONFIG.brandName} | ${STORE_CONFIG.slogan}`,
    template: `%s | ${STORE_CONFIG.brandName}`,
  },
  description: 'Loja própria ART com catálogo oficial, carrinho e pedido assistido pelo WhatsApp.',
  icons: {
    icon: STORE_CONFIG.logo.dark,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
