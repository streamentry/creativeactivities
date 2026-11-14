# Domain cutover: dementiaactivities.games to creativeactivities.org

Status: steps 1–3 done 2026-11-14; step 4 is this change. Planned 2026-11-13. `site/astro.config.mjs` and `site/wrangler.jsonc` already target creativeactivities.org; everything a shipped app or store listing points at still uses the old domain, which stays live until the cutover below is done. Nothing here is deployed or approved for release.

Order matters: a shipped app must never link to a host that does not answer yet.

1. **Bring the new host up.** Add the creativeactivities.org zone and custom domain, deploy `site/`, and confirm `/`, `/app-privacy/`, `/sitemap.xml` and a legal page return 200.
2. **Email.** Create `web@creativeactivities.org` in Cloudflare Email Routing and send a test message. Keep `web@dementiaactivities.games` forwarding.
   Done 2026-11-14: rule "Website contact" forwards to the maintainer's verified inbox; MX and SPF resolve; a test message arrived.
3. **Redirects.** `www.creativeactivities.org` 301s to the apex (`site/redirect-www-creative/`, deployed 2026-11-14).
   **Changed by the maintainer on 2026-11-14:** dementiaactivities.games is a separate product and is *not* redirected; its Worker, domain and `redirect-www/` stay as they are. Shipped app builds still link to its legal and help pages, so those pages must keep answering until every supported build links to creativeactivities.org.
4. **Switch references**, in one change, after step 1 to 3 pass:
   - `site/src/lib/site.ts` support email; `site/scripts/make-images.py`; `site/README.md`, `site/CONTENT_GUIDE.md`, `site/package.json` text.
   - `metadata/google-play.en-US.json` and `metadata/app-store.en-US.json` URLs, then `python3 scripts/release_metadata.py` to regenerate exports.
   - `tests/test_app_legal_links.py`, and the 65 `lib/l10n/arb` files that carry the URL (a store build ships these; the new host must answer first).
5. **Search Console / IndexNow.** Add the new property, submit the sitemap, and use the change-of-address tool for the old one.
6. **Verify**: `site/scripts/verify-live-legal.mjs` against the new host, then the checks in AGENTS.md.

Unverified until done: DNS, certificates, email routing and Search Console state live outside this repository.
