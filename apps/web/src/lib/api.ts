import { levelMapResponseSchema, type LevelMapResponse } from '@deutschfreak/validation';
import { readApiUrl } from './config.ts';

// Server-side calls to the API (TRD-FE-01). Every response is checked with the same Zod schema the API uses
// (TRD-FE-05). Content changes only when it is seeded, so responses are cached for five minutes.
const revalidateSeconds = 300;

/** The API could not be reached or answered with an unexpected status or shape. The page shows its error state. */
export class ApiRequestError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ApiRequestError';
  }
}

async function getJson(path: string, fetchImpl: typeof fetch): Promise<unknown | null> {
  let response: Response;
  try {
    response = await fetchImpl(`${readApiUrl()}${path}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: revalidateSeconds },
    } as RequestInit);
  } catch (error) {
    throw new ApiRequestError(`The API could not be reached for ${path}.`, { cause: error });
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new ApiRequestError(`The API answered ${response.status} for ${path}.`);
  return response.json();
}

/** The German Map of one level (`GET /v1/levels/:code/map`), or null when the level does not exist. */
export async function getLevelMap(code: string, fetchImpl: typeof fetch = fetch): Promise<LevelMapResponse | null> {
  const body = await getJson(`/v1/levels/${encodeURIComponent(code)}/map`, fetchImpl);
  if (body === null) return null;
  const parsed = levelMapResponseSchema.safeParse(body);
  if (!parsed.success)
    throw new ApiRequestError('The map response does not match its schema.', { cause: parsed.error });
  return parsed.data;
}
