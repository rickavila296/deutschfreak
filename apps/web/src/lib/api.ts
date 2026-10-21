import {
  apiErrorResponseSchema,
  lessonResponseSchema,
  levelMapResponseSchema,
  type ApiErrorCode,
  type LessonResponse,
  type LevelMapResponse,
} from '@deutschfreak/validation';
import { readApiUrl } from './config.ts';

// Server-side calls to the API (TRD-FE-01). Every response is checked with the same Zod schema the API uses
// (TRD-FE-05). Content changes only when it is seeded, so responses stay in Next's data cache for five minutes.
// Pages call connection() rather than `dynamic = 'force-dynamic'`, which would turn this cache off (review 4
// finding 3; Next 16 docs: force-dynamic sets every fetch to no-store).
const revalidateSeconds = 300;

/** The API could not be reached or answered with an unexpected status or shape. The page shows its error state. */
export class ApiRequestError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ApiRequestError';
  }
}

/**
 * GETs an API path. Returns { found: false } only when the API itself says the thing does not exist: a 404 in its error shape
 * with `notFoundCode` (decision 0015). Any other 404 (a wrong NEXT_PUBLIC_API_URL, a page in front of the API) and any
 * body that is not JSON is an ApiRequestError, so the page shows its error state, not "Page not found" (review 4
 * findings 4 and 5). A separate flag, not null, marks "not found", so a 2xx body that is literally null goes to the
 * schema check and fails there (review 4b finding 1).
 */
type JsonResult = { found: false } | { found: true; body: unknown };

async function getJson(path: string, notFoundCode: ApiErrorCode, fetchImpl: typeof fetch): Promise<JsonResult> {
  let response: Response;
  try {
    response = await fetchImpl(`${readApiUrl()}${path}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: revalidateSeconds },
    } as RequestInit);
  } catch (error) {
    throw new ApiRequestError(`The API could not be reached for ${path}.`, { cause: error });
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new ApiRequestError(`The API answered ${response.status} for ${path} without a JSON body.`, { cause: error });
  }
  if (response.status === 404) {
    const apiError = apiErrorResponseSchema.safeParse(body);
    if (apiError.success && apiError.data.error.code === notFoundCode) return { found: false };
    throw new ApiRequestError(`Unexpected 404 for ${path}; is NEXT_PUBLIC_API_URL the API?`);
  }
  if (!response.ok) throw new ApiRequestError(`The API answered ${response.status} for ${path}.`);
  return { found: true, body };
}

/** What getChecked needs from a shared Zod schema. */
interface CheckSchema<T> {
  safeParse(value: unknown): { success: true; data: T } | { success: false; error: unknown };
}

/**
 * GETs an API path and checks the body with its shared schema (TRD-FE-05). Null for the API's own not-found answer;
 * an ApiRequestError for anything unexpected, including a body the schema refuses (review 4 finding 9).
 */
async function getChecked<T>(
  path: string,
  notFoundCode: ApiErrorCode,
  schema: CheckSchema<T>,
  label: string,
  fetchImpl: typeof fetch,
): Promise<T | null> {
  const result = await getJson(path, notFoundCode, fetchImpl);
  if (!result.found) return null;
  const parsed = schema.safeParse(result.body);
  if (!parsed.success) {
    throw new ApiRequestError(`The ${label} response does not match its schema.`, { cause: parsed.error });
  }
  return parsed.data;
}

/**
 * A published lesson without answers (`GET /v1/lessons/:slug`), or null when there is none: the API answers 404
 * `lesson_not_found` for an unknown slug and for a planned lesson (decision 0017), so both show the not-found page
 * (decision 0028).
 */
export function getLesson(slug: string, fetchImpl: typeof fetch = fetch): Promise<LessonResponse | null> {
  const path = `/v1/lessons/${encodeURIComponent(slug)}`;
  return getChecked(path, 'lesson_not_found', lessonResponseSchema, 'lesson', fetchImpl);
}

/** The German Map of one level (`GET /v1/levels/:code/map`), or null for 404 `level_not_found`. */
export function getLevelMap(code: string, fetchImpl: typeof fetch = fetch): Promise<LevelMapResponse | null> {
  const path = `/v1/levels/${encodeURIComponent(code)}/map`;
  return getChecked(path, 'level_not_found', levelMapResponseSchema, 'map', fetchImpl);
}
