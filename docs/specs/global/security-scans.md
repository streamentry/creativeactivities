# Security scans and checks (record)

Items: [TSA-041](14-trust-safety-accessibility-privacy.md) (headers and CSP), [TSA-042](14-trust-safety-accessibility-privacy.md) (third-party scripts, fonts, integrity) and [TSA-043](14-trust-safety-accessibility-privacy.md) (secrets and dependencies).

Recorded 2026-11-15 on branch `s2h/h3-privacy-security`. Re-run and add a dated entry at each release.

## 1. Live response headers (TSA-041)

Read with `curl -sI https://creativeactivities.org/` on 2026-11-15, before the change in this branch is deployed.

| Header | Live value | Verdict |
|---|---|---|
| `strict-transport-security` | `max-age=31536000; includeSubDomains` | Meets target |
| `x-content-type-options` | `nosniff` | Meets target |
| `x-frame-options` | `DENY` | Meets target |
| `referrer-policy` | `strict-origin-when-cross-origin` | Meets target |
| `permissions-policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Meets target |
| `cross-origin-opener-policy` | `same-origin` | Extra |
| `content-security-policy` | `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; ...` | **Was live with `'unsafe-inline'` for scripts.** This branch removes it and lists the inline script hashes. Re-scan after deploy. |

What the branch changes in `site/public/_headers`:

- `script-src` no longer has `'unsafe-inline'`. It lists `'self'`, the 19 inline module-script hashes Astro writes into every page, and `https://www.googletagmanager.com`. The meta CSP already allowed only those hashes, so behaviour does not change; the header now says so too.
- `site/scripts/check-site.mjs` fails the build when a page's hash is missing from the header, or when `'unsafe-inline'` returns to `script-src`.
- `style-src` keeps `'unsafe-inline'`. Astro inlines component CSS. Removing it needs style hashes and is not in this batch.
- The Photo pairs rules (`/games/photo-pairs/` and `/:lang/games/photo-pairs/`) also drop `'unsafe-inline'` for scripts and allow no outside origin.

## 2. Third-party assets and fonts (TSA-042)

- **Fonts:** self-hosted. `site/dist/fonts/` holds 19 files (Atkinson Hyperlegible Next, Noto Sans and Serif Ethiopic, Roboto subsets). No built page refers to `fonts.googleapis.com` or `fonts.gstatic.com`.
- **External scripts:** one, the Google Tag Manager loader (`Analytics.astro`). **It has no SRI, and this cannot change.** Google changes `gtm.js` for each container, so no fixed hash exists. The reason is recorded in `site/src/lib/data-inventory.test.ts`, which fails for any other external script or stylesheet without `integrity`.
- **Outside origins:** the full list is in [data-inventory.md](data-inventory.md), section 4.
- **Open decision:** the GTM loader on every page except photo pairs (see [data-inventory.md](data-inventory.md), section 6).

## 3. Dependency audit (TSA-043)

Command: `pnpm audit --prod` and `pnpm audit` in `site/`, 2026-11-15. Reported only. **Nothing was upgraded.**

Production dependencies: 2 advisories, both on `astro` 7.4.0 (pinned exactly in `site/package.json`).

| Severity | Package | Advisory | Vulnerable | Patched |
|---|---|---|---|---|
| moderate | astro | Image endpoint in `@astrojs/node` can read files from a case-variant sibling directory on case-sensitive filesystems (GHSA-r3h5-4585-7x3w) | >=5.14.3 <=7.4.6 | >=7.4.7 |
| low | astro | XSS via attribute injection in dynamic tag names (GHSA-mh32-jxcr-mh9f) | <=7.4.4 | >=7.4.5 |

The site builds to static files and does not use `@astrojs/node`, so the first advisory is unlikely to apply. The second affects dynamic tag names, which the site does not use. **Recommended for the maintainer:** a patch-level upgrade of `astro` to 7.4.7 or later, after the build and visual checks pass. Not done here, per the brief.

Development dependencies (full audit): 10 advisories, 8 on `undici` (4 high), 2 on `astro`. These come from the tooling (`wrangler`, `vitest`, `playwright`) and do not ship to visitors. Upgrade with the tooling update.

Raw output: `/Volumes/SANDISK-Data/ca-shots/h3/audit-prod.json` and `audit-full.json`.

## 4. Secrets in the repository (TSA-043)

`site/src/lib/secrets.test.ts` scans every git-tracked text file (13,828 files on 2026-11-15) for AWS keys, private key blocks, Google API keys, live Stripe keys, GitHub and Slack tokens, and assigned secrets. It also fails when signing material or key files are tracked (`key.properties`, `*.jks`, `*.keystore`, `*.p12`, `*.pfx`, `*.p8`, `*.mobileprovision`). **Result: no matches, no tracked signing files.** The check runs in `pnpm test`, which is the CI test step.

The app's signing material is not in the repository. The scan does not cover secrets stored in the platform's secret manager; that is a maintainer check.

## 5. Not yet done

- Re-scan the live headers after deploy, and record that scan here.
- Maintainer decision on the `astro` patch upgrade (section 3).
- Maintainer decision on the GTM loader (inventory section 6).
