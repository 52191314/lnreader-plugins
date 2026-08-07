# Lint & Format Gates — problems, root causes, fixes

Two repo-wide quality gates (`pnpm run lint`, `pnpm run format:check`) were
failing for months on every checkout. Both are now green (exit 0) as of
commits 6ce515d / d8d6498 / a3a53a3 on master. This document records what
was broken, why, and how it was fixed so the gates stay green.

## Current state

| Gate | Command | Before | After |
|------|---------|--------|-------|
| Lint | `pnpm run lint` | 79 problems (73 errors, 6 warnings) | exit 0 |
| Format | `pnpm run format:check` | 191 files flagged | exit 0, "All matched files use Prettier code style!" |
| Types | `npx tsc --project tsconfig.production.json --noEmit` | — | exit 0 |

---

## Problem 1 — Lint: `no-empty` in every generated [madara] plugin

### Symptom

`pnpm run lint` reported ~71 `Empty block statement (no-empty)` errors, all
in generated `plugins/<lang>/<Name>[madara].ts` files, plus a handful of
one-off issues in standalone files.

### Root cause

The madara multisrc template has a placeholder for per-site custom JS:

```ts
if (this.options?.customJs) {
  try {
    // CustomJS HERE
  } catch (error) {
    console.error('Error executing customJs:', error);
    throw error;
  }
}
```

The generator (`plugins/multisrc/madara/generator.js`) replaces the
`// CustomJS HERE` comment with the site's `customJs` option — or with an
empty string when the site has no custom JS. So every madara instance
without custom JS shipped an **empty `try` block**, and eslint's `no-empty`
rule flagged it in all ~71 generated files. Because the generated files are
gitignored, the errors were invisible in PRs but fired on every CI lint run
and on any machine after `npm run build:multisrc`.

### Fix (commit 6ce515d)

Added a no-op statement to the placeholder block in
`plugins/multisrc/madara/template.ts`:

```ts
try {
  // CustomJS HERE
  void 0;
} catch (error) {
```

The generator's string replacement is untouched — sites with custom JS still
get their code injected; sites without it now produce a non-empty block.

### Same commit — one-off fixes

- `plugins/arabic/rewayatfans.ts` — `Array<T>` → `T[]` (array-type), removed
  an unused `showLatestNovels` destructure, replaced `as any` with a typed
  `content?: { rendered: string }` field on `WPPage`.
- `.github/scripts/add-multisrc-source.cjs` — dropped a `no-useless-escape`
  (`\/` → `/`).
- `plugins/multisrc/lightnovelwp/sources.json` — two `customJs` snippets had
  unused callback params (NovelsKnight `function (i, el)`, Requiem
  Translations `const [_, ...]`) → dropped the unused names.

---

## Problem 2 — Format: every file flagged as unformatted on Windows

### Symptom

`pnpm run format:check` flagged **191 files** — including files that were
never touched (`.prettierrc.js` itself, `src/types/*`, `vite.config.ts`,
untouched plugins like `novelphoenix.ts`). The failures appeared only on
Windows checkouts.

### Root cause

Two things stacked:

1. The repo had **no `.gitattributes`**, and
2. Windows git is configured with `core.autocrlf=true`,

so every `git checkout` on Windows converted LF line endings to CRLF in the
working tree. Prettier's default `endOfLine` is `lf`, so it flagged *every*
file whose on-disk bytes were CRLF — regardless of whether the committed
content was correct. The repo's actual blobs were always LF (only
`public/icon.svg` was stored as CRLF); the *working tree* was corrupted on
checkout, and the git status noise ("M" on hundreds of files) was a second
symptom of the same thing.

### Fix (commit d8d6498)

Added `.gitattributes` pinning LF everywhere:

```gitattributes
* text=auto eol=lf

*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.webp binary
*.ico binary
*.svg binary
*.woff binary
*.woff2 binary
*.ttf binary
*.otf binary
*.eot binary
*.zip binary
*.gz binary
*.pdf binary
```

`eol=lf` overrides `core.autocrlf`, so checkouts are LF on every platform.
Then renormalized the index: `git add --renormalize .` (only
`public/icon.svg` actually changed — it was the sole CRLF-stored blob).

After a full worktree refresh, the remaining format failures were 9
standalone plugins that had been committed genuinely unformatted. Those were
formatted in a follow-up commit (a3a53a3) — pure style, no logic changes.

---

## Keeping the gates green (rules of thumb)

- **Never run `npm run format`** (it's `prettier --write` over the whole
  tree). Use `pnpm run format:check` or scoped
  `npx prettier --check <files>`.
- **Never hand-edit `.gitattributes`** to add `text`/`binary` markers without
  re-running `git add --renormalize .` and verifying
  `pnpm run format:check`.
- **If you touch `plugins/multisrc/madara/template.ts`**, regenerate the
  multisrc files (`npm run build:multisrc`) and re-run
  `pnpm run lint` — the generated instances are what CI lints.
- **On Windows**, if `git status` suddenly shows hundreds of modified files
  after a checkout, it's usually the stat cache / EOL — run
  `git add -u && git status` to refresh before assuming a real change.
- If a new multisrc family is added, give its template the same treatment:
  no empty try/catch blocks (add `void 0;` or restructure), and check the
  generated files lint clean.

## Verification (how to confirm green)

```sh
pnpm run lint
pnpm run format:check
npx tsc --project tsconfig.production.json --noEmit
```

All three exit 0 on master (as of a3a53a3).
