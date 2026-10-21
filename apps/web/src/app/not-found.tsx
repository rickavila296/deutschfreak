import type { Metadata } from 'next';
import { NotFoundMessage } from '../components/states/not-found-message.tsx';

export const metadata: Metadata = { title: 'Page not found · DeutschFreak' };

// Every notFound() call and every unknown address render this inside the page shell, with status 404.
export default function NotFound() {
  return <NotFoundMessage />;
}
