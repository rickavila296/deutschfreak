import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findUnit } from '../../../../components/map/map-rules.ts';
import { UnitPage } from '../../../../components/map/unit-page.tsx';
import { getLevelMap } from '../../../../lib/api.ts';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function load(slug: string) {
  const map = await getLevelMap('A1');
  return map ? findUnit(map, slug) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load((await params).slug);
  return { title: found ? `${found.unit.title} · DeutschFreak` : 'DeutschFreak' };
}

// A unit page at /learn/units/<slug> (decision 0028). An unknown slug shows the not-found page with 404.
export default async function UnitRoute({ params }: Props) {
  const found = await load((await params).slug);
  if (!found) notFound();
  return <UnitPage part={found.part} unit={found.unit} />;
}
