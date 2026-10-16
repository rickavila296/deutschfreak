# DeutschFreak

DeutschFreak is an open-source, English-first website for learning German. It is browse-first: part structured course,
part searchable knowledge base, part pronunciation reference, part practice engine, and part guide to the language of
everyday life in Germany.

The planned range is A1 to B2. The first release covers A1.1 only.

## Development

Requires Node 24 (see `.nvmrc`) and pnpm through Corepack (`corepack enable`, once, in an Administrator PowerShell).

```powershell
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

The workspace has `apps/*` and `packages/*`. Build progress is logged in `PROGRESS.md`.
