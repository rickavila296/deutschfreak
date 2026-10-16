import app from './index.ts';

// Local development server: the same app Vercel serves (src/index.ts), on a local port. Not a Vercel entry file.
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  process.stdout.write(`API listening on http://localhost:${port}\n`);
});
