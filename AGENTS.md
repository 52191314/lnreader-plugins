# AGENTS.md — build & release method for this repo

Guidance for AI agents working in lnreader-plugins. Short version of the
procedures that matter; keep this file updated when the workflow changes.

## Toolchain

- **Use npm.** `package-lock.json` is present; `pnpm run lint` may fail with
  `ERR_PNPM_IGNORED_BUILDS` (an install-gate that needs an interactive
  `pnpm approve-builds`). npm is the reliable path.
- Verification per plugin file:
  - `npx eslint plugins/<lang>/<file>.ts`
  - `npx prettier --check plugins/<lang>/<file>.ts`
  - `npx tsc --project tsconfig.production.json --noEmit`
- Repo-wide gates are GREEN on master (as of a3a53a3): `pnpm run lint`,
  `pnpm run format:check`, and `npx tsc --project tsconfig.production.json
  --noEmit` all exit 0. History of the lint/format problems and fixes:
  `docs/lint-format-gates.md`.
- `npm run format` is `prettier --write .` — it rewrites the ENTIRE tree.
  Use `pnpm run format:check` (or scoped `npx prettier --check <files>`) for
  verification, never the write form.

## Build (producing release artifacts)

1. `npm run build:full` — runs clean:multisrc → build:multisrc → tsc →
   manifest. Outputs: generated instances under `plugins/<lang>/` (only for
   multisrc changes), compiled bundles under `.js/plugins/`, and the
   manifest `.dist/plugins.json` + `.dist/plugins.min.json`.
2. **Pitfall — restore the legacy tree after every build:**
   clean:multisrc deletes the gitignored legacy copies under
   `.js/src/plugins/` (its `find` glob matches `*[madara]*.js` under any
   "plugins" path). Restore immediately:
   ```sh
   rm -rf .js/src/plugins && cp -r .js/plugins .js/src/plugins
   ```
3. **Pitfall — keep loose `.ts` files OUT of the repo root.**
   `tsconfig.production.json` has NO `include` list, so `tsc` compiles
   every `.ts` under the repo. A stray tree of copied plugin files (e.g. a
   `Sibling/` taxonomy at the repo root) shifts tsc's computed `rootDir`,
   so compiled output lands at `.js/plugins/plugins/english/<p>.js`
   (double `plugins/`) instead of `.js/plugins/english/<p>.js`, and the
   manifest silently misses the plugin. Any such reference tree must live
   OUTSIDE the repo (e.g. `D:\02_Projects\Sibling\`), not inside it.
4. Verify artifacts: `.dist/plugins.json` shows the new version (minified
   field order: `"id":"<plugin>"` … `"version":"X.Y.Z"` — grep carefully or
   walk with python/json); `.js/plugins/<lang>/<file>.js` and
   `.js/src/plugins/<lang>/<file>.js` byte-identical (`cmp`). Compiled JS is
   minified (local var names rewritten, e.g. `filters.sort.value` becomes
   `h.sort.value`) — grep for literal strings, not var references.

## Release to master (this repo's release line)

Releases are DIRECT commits to master (no PRs in-repo; PRs are only for
upstream). Every release bumps `version` in the plugin class.

**All PRs in this repo are opened MANUALLY by the user.** Agents prepare
branches, commit, and push (`git push origin <branch>`), but never run
`gh pr create` — the user opens the PR themselves in the GitHub UI.

1. Edit the plugin `.ts`, bump `version`.
2. Build + verify (see above).
3. Commit, force-adding the gitignored artifacts + source + icon:
   ```sh
   git add -f .dist/plugins.json .dist/plugins.min.json \
     .js/plugins/<lang>/<file>.js .js/src/plugins/<lang>/<file>.js \
     plugins/<lang>/<file>.ts public/static/src/<lang>/<id>/icon.png
   git commit -m "feat|fix|refactor(<lang>): release version X.Y.Z with <what>"
   ```
   The lint-staged husky hook runs prettier on staged files; it may fail
   re-staging `.js` (gitignored) — cosmetic, the commit still lands.
4. Push to origin master.

## New plugins / multisrc instances

- New standalone plugin: version starts at `1.0.0`; icon must be exactly
  96x96 PNG at `public/static/src/<lang>/<id>/icon.png`, referenced as
  `icon = 'src/<lang>/<id>/icon.png'`; use `import { Plugin } from
  '@/types/plugin'`.
- Multisrc instance addition: edit `plugins/multisrc/<theme>/sources.json`
  (entry: id, sourceSite, sourceName, options) + add the icon at
  `public/static/multisrc/<theme>/<id>/icon.png`, then regenerate with the
  multisrc build. The generated `plugins/<lang>/<Name>[<theme>].ts` files
  are gitignored — never commit them.
- Before writing a standalone plugin, check the site for a SIBLING (same
  CMS/template, cross-linked sites) — see `Sibling/` taxonomy for existing
  families; siblings ship as parallel standalone plugins.

## Pre-flight review (Kingfisher)

- ALWAYS load the `kingfisher-review` skill and run its pre-flight review
  pass before committing ANY plugin change (new plugin, fix, or multisrc
  instance). It is a private lens for catching the kind of nitpicks a
  maintainer would catch — never post its output to GitHub or attribute it
  to K1ngfish3r.

## Other rules

- `.broken.ts` plugins: don't "fix" unless asked — they're intentionally
  disabled.
- Never delete or modify files under `public/static/src/<lang>/<id>/` icons
  of other plugins without asking.
