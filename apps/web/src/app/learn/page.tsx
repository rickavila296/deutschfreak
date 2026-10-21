import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { GermanMap } from '../../components/map/german-map.tsx';
import { getLevelMap } from '../../lib/api.ts';

export const metadata: Metadata = { title: 'German Map · DeutschFreak' };

// The German Map at /learn (decision 0028), a server component that fetches from the API (TRD-FE-01).
export default async function LearnPage() {
  await connection();
  const map = await getLevelMap('A1');
  if (!map) notFound();
  return <GermanMap map={map} />;
}
