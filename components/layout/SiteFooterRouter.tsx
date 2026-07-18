'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './SiteFooter';

export function SiteFooterRouter() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  return <SiteFooter variant={pathname === '/' ? 'editorial' : 'compact'} />;
}
