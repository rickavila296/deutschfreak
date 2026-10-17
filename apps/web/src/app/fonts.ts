import localFont from 'next/font/local';

// Inter (DESIGN-TYPE-01), served from the app's own files and never from a font service (DESIGN-HAND-02). The
// variable font comes from the @fontsource-variable/inter package (SIL Open Font License 1.1); next/font copies it
// into the build and preloads it. The latin subset covers ä, ö, ü and ß (DESIGN-TYPE-04); weights 400 to 700.
export const inter = localFont({
  src: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
});
