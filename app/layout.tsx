import type { Metadata } from 'next';
import { Barlow_Condensed, Manrope } from 'next/font/google';
import './globals.css';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { STORE_CONFIG } from '@/lib/config';

const display = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const interfaceFont = Manrope({
  subsets: ['latin'],
  variable: '--font-interface',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://useart.local'),
  title: {
    default: `${STORE_CONFIG.brandName} | ${STORE_CONFIG.slogan}`,
    template: `%s | ${STORE_CONFIG.brandName}`,
  },
  description: 'Peças autorais ART para o movimento de todos os dias.',
  icons: {
    icon: STORE_CONFIG.logo.dark,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={`${display.variable} ${interfaceFont.variable}`}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
