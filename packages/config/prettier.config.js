/** @type {import('prettier').Config} */
export default {
  singleQuote: true,
  printWidth: 120,
  // Content YAML keeps double quotes, so German apostrophes (Wie geht's?) never need escaping.
  overrides: [{ files: '*.{yaml,yml}', options: { singleQuote: false } }],
};
