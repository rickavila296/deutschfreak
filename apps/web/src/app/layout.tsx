import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'DeutschFreak',
};

// Root layout. The page shell (header, navigation, footer, skip link) comes in task 4.4, the theme in task 4.2.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
