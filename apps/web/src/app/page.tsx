import { notFound } from 'next/navigation';
import { GermanMap } from '../components/map/german-map.tsx';
import { getLevelMap } from '../lib/api.ts';

export const dynamic = 'force-dynamic';

// Home shows the German Map until a home page is built (decision 0028).
export default async function HomePage() {
  const map = await getLevelMap('A1');
  if (!map) notFound();
  return <GermanMap map={map} />;
}
