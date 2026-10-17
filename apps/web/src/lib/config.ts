// Web app settings from the environment (TRD §25). NEXT_PUBLIC_API_URL is public by design (TRD-ENV-01): Next.js
// inlines it into the build, so it must never hold a secret.

/** Reads the API base URL, or throws an error that names the variable. The result has no trailing slash. */
export function readApiUrl(value: string | undefined = process.env.NEXT_PUBLIC_API_URL): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error('NEXT_PUBLIC_API_URL is not set. Add it to the .env file in the repo root (see .env.example).');
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL is not a URL. It must be the API origin, such as http://localhost:4000');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('NEXT_PUBLIC_API_URL must start with https:// or http://.');
  }
  if (url.username || url.password) throw new Error('NEXT_PUBLIC_API_URL must not contain a user name or password.');
  if (url.search || url.hash || trimmed.includes('?')) {
    throw new Error('NEXT_PUBLIC_API_URL must not contain a query or fragment.');
  }
  // The API's routes start at its root (/health, /v1/...), so a base path is kept but its trailing slash is not.
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}
