import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '../components/site-footer.tsx';
import { SiteHeader } from '../components/site-header.tsx';
import { SkipLink } from '../components/skip-link.tsx';
import { inter } from './fonts.ts';
import './globals.css';

export const metadata: Metadata = {
  title: 'DeutschFreak',
};

// The page shell of every page: skip link first (DESIGN-UI-006), header with primary navigation, the page in
// <main id="main">, footer. Content is centred at most 1200 px wide with the section 14 side margins.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-body text-ink">
        <SkipLink />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page flex-1 px-4 py-12 md:px-6 lg:px-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
