'use client';

import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { LoadErrorMessage } from '../components/states/load-error-message.tsx';

// Shown when a page's data cannot be loaded (FLOW-ERR-002). It sits inside the root layout, so the header and
// navigation keep working. "Try again" fetches the page from the server again.
export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  return (
    <LoadErrorMessage
      onRetry={() =>
        startTransition(() => {
          router.refresh();
          reset();
        })
      }
    />
  );
}
