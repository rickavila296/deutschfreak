import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { LessonPage } from '../../../../components/lesson/lesson-page.tsx';
import { getLesson } from '../../../../lib/api.ts';

interface Props {
  params: Promise<{ slug: string }>;
}

async function load(slug: string) {
  await connection();
  return getLesson(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = await load((await params).slug);
  return { title: lesson ? `${lesson.lesson.title} · DeutschFreak` : 'DeutschFreak' };
}

// A lesson page at /learn/lessons/<slug> (decision 0028). A planned lesson or an unknown slug: the API answers 404
// (decision 0017) and the page shows the not-found page with status 404 (FLOW-OQ-05).
export default async function LessonRoute({ params }: Props) {
  const lesson = await load((await params).slug);
  if (!lesson) notFound();
  return <LessonPage lesson={lesson} />;
}
