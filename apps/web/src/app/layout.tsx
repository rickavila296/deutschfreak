import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { inter } from './fonts.ts';
import './globals.css';

export const metadata: Metadata = {
  title: 'DeutschFreak',
};

// Root layout. The page shell (header, navigation, footer, skip link, focus styles) comes in task 4.4.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white font-sans text-body text-ink">{children}</body>
    </html>
  );
}
