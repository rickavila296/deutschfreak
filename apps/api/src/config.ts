// API settings from the environment (TRD §25). Values are never logged or put in error messages (decision 0014).

export interface ApiConfig {
  /** The one browser origin CORS allows (TRD-SEC-15). */
  webOrigin: string;
}

/** Reads the API settings, or throws an error that names the variable but never shows its value. */
export function readApiConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const value = env.WEB_ORIGIN?.trim();
  if (!value) throw new Error('WEB_ORIGIN is not set. Add it to the .env file in the repo root (see .env.example).');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('WEB_ORIGIN is not a URL. It must be an origin such as https://deutschfreak.com');
  }
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || url.origin !== value) {
    throw new Error('WEB_ORIGIN must be a bare origin (scheme, host and port only, no path or trailing slash).');
  }
  return { webOrigin: url.origin };
}
