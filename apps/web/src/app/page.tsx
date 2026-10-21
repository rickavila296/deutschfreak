import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { GermanMap } from '../components/map/german-map.tsx';
import { getLevelMap } from '../lib/api.ts';
import { routes } from '../lib/routes.ts';

// `/` shows the same page as `/learn`, so search engines are told that /learn is the address to index (review 4b
// finding 5).
export const metadata: Metadata = {
  title: 'German Map · DeutschFreak',
  alternates: { canonical: routes.learn },
};

// Home shows the German Map until a home page is built (decision 0028).
export default async function HomePage() {
  await connection();
  const map = await getLevelMap('A1');
  if (!map) notFound();
  return <GermanMap map={map} />;
}
