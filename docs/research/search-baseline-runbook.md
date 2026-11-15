# Search demand and measurement baseline runbook

Status: draft, 2026-11-14. Covers [SEO-002](../specs/global/12-search-geo-distribution.md) (replace the wrong-market demand data) and [SEO-004](../specs/global/12-search-geo-distribution.md) (search consoles and a measurement baseline). Steps marked **maintainer** need a logged-in account or a human decision. An agent may check the files that come back, but must not create accounts, verify domains, change DNS, buy anything, or start ad campaigns.

Inputs in this folder: [s1-query-list.csv](s1-query-list.csv) (44 rows: the 15 clusters from [research/05 section 6](../specs/global/research/05-search-scale-trust.md) plus repo keyword rows, each with cluster, intent and notes; no volumes). Output folder: `docs/research/search-data/` (create it when the first file is saved).

Why this matters: the current export in `keywords.csv` is priced in VND, so its targeting is Vietnam. Its rows are not a US demand map ([keywords-2026-11-13.md](../strategy/keywords-2026-11-13.md)). The S1 hubs depend on this record ([roadmap §2](../specs/global/18-roadmap.md): "If that record does not exist, the S1 hubs are not yet justified").

## Part A. Demand data (SEO-002)

### A1. Google Keyword Planner, United States, English (maintainer)

1. Sign in to the Google Ads account the maintainer already uses. Do not create a campaign and do not add a payment method for this step.
2. Open Tools, then Keyword Planner. Choose "Discover new keywords" or "Get search volume and forecasts".
3. Set Location to United States and Language to English before you enter any term. Record these two settings.
4. Enter the query list in batches from `s1-query-list.csv`, column `query`. Planner may limit how many terms one request takes, so split the list as needed. Use the rows where `cluster` is not "Not ranked" first, then the head terms.
5. Set the date range to the last 12 months. Record the exact date range shown.
6. Download the results as CSV. Save the raw download exactly as given. Do not edit it, and do not delete rows, even if a figure looks wrong.
7. Keep blank cells blank. A blank means unknown, not zero (SEO-002 acceptance).

### A2. Contrasting market (maintainer decision, then the same steps)

R5 suggests one contrasting market. The choice is the maintainer's. A suggested default: United Kingdom with English, because it reuses the query list without translation. Record the choice in the metadata file. Repeat A1 with that location. Do not use the contrasting market to set a US target.

### A3. Google Trends and Pinterest Trends (maintainer)

- Google Trends: US, past five years, for the cluster example queries (one comparison per cluster, not a mix of clusters in one request, so that relative values stay readable). Download the CSV. Trends values are relative, not volumes.
- Pinterest Trends: the same terms, US. Record the values shown and whether an export is available; if none is, save a dated screenshot taken by the maintainer, not by an agent.

### A4. SERP audit, top 10 per cluster (maintainer)

For each cluster, search the example queries in a clean, logged-out browser profile, US, English. Record the top 10 organic results and the following columns in `search-data/YYYY-MM-DD-serp-audit.csv`:

| Column | Values |
| --- | --- |
| query | As entered |
| cluster | As in `s1-query-list.csv` |
| rank | 1 to 10 |
| domain | Host name only |
| domain_type | creator, publisher, care service, medical, government, marketplace, social or other |
| page_type | article, list, product, forum, video, printable, game, app listing or other |
| ai_overview | yes, no or blank (not checked) |
| playable_or_printable | yes, no or blank |
| needs_signup | yes, no or blank |
| checked_on | Date |

Result: one table that shows, for each cluster, the result types in the top 10, and whether a caregiver can act on any result without signing up (SEO-002 acceptance). Do not record personal data from search results.

Repeat the audit after 6 to 8 weeks of Search Console data for the launched pages.

### A5. Metadata for every file

Save a sidecar next to each export, named the same with `.meta.json`:

```json
{
  "file": "2026-11-20-keyword-planner-us-en.csv",
  "source": "Google Keyword Planner",
  "location": "United States",
  "language": "English",
  "network": "Google Search",
  "period": "2025-11 to 2026-10 (copy the label shown)",
  "export_date": "2026-11-20",
  "exported_by": "maintainer",
  "method": "Discover new keywords with s1-query-list.csv query column, batches of N",
  "blank_means": "unknown",
  "notes": ""
}
```

Remove account IDs, customer IDs and email addresses from any file before it is committed. If a file cannot be cleaned, do not commit it; record its location in the verification log instead.

## Part B. Search consoles and baseline (SEO-004)

Canonical host: `https://creativeactivities.org` (`site/src/lib/site.ts`). Before verifying, check the redirect worker in `site/redirect-www/`: it still names an older host, `dementiaactivities.games`, while `site/redirect-www-creative/` names this one. Confirm which host the live redirects use.

### B1. Google Search Console (maintainer)

1. Add a Domain property for `creativeactivities.org` (preferred: it covers every protocol and sub-domain). Verification uses a DNS TXT record that the maintainer adds at the DNS provider. Do not paste verification tokens into the repo.
2. If a Domain property is not possible, add a URL-prefix property for `https://creativeactivities.org/` and verify it with the method offered.
3. Submit the sitemap index: `https://creativeactivities.org/sitemap.xml`. Check that the sitemap contains only canonical, indexable URLs (the existing test `site/src/lib/sitemap.test.ts` covers this).
4. Check the Sitemaps report after two days. Record the status and count of discovered URLs.
5. Export for the baseline window (see B3). Use the Performance report, Search type Web. Export two files: queries and pages. Save both in `search-data/`.

### B2. Bing Webmaster Tools (maintainer)

1. Add `https://creativeactivities.org` as a site. Bing may offer an import from Search Console; if so, use it and record that you did. Otherwise verify with a DNS, meta tag or XML file method. The verification token stays out of the repo.
2. Submit the same sitemap index.
3. Export the Search Performance data for the same window. Keep it as Bing data. Do not describe Bing's index as any other AI system's index ([SEO.md §7.1](../../SEO.md)).
4. IndexNow: use only for URLs that were truly added, changed or removed, and never as an indexing guarantee ([SEO.md §6.4](../../SEO.md)). Not needed for the baseline.

### B3. Baseline window and what to record

- Window: the 28 days before the first S1 page goes live, plus the 3 months before that if the data exists. Search Console keeps 16 months, so export before that is lost.
- Exclude branded queries from the nonbranded figure. Brand terms, to be confirmed by the maintainer: "creative activities", "creativeactivities", "golden moments".
- Record for the window: nonbranded impressions, nonbranded clicks, number of distinct nonbranded queries with at least one impression, number of pages with impressions, and the export date.
- Set the S1 growth threshold in writing before launch, from this baseline. VISION says the exact traffic thresholds must come from the baseline after Search Console is connected. Do not set the threshold after seeing post-launch data.

### B4. Cluster baseline (method)

Map each query in the Search Console queries export to a cluster from `s1-query-list.csv`, by exact match first, then by the rule the maintainer writes down (for example, "contains all the words"). Queries that match no cluster go in an "other" row, not dropped. Then sum impressions by cluster for the window. A cluster with no matching query shows zero impressions for that window; leave it blank only if the export does not cover the window.

```python
# Method sketch for the maintainer. Column names are the English Search Console labels.
import csv
from collections import defaultdict

clusters = {}
for row in csv.DictReader(open("docs/research/s1-query-list.csv", encoding="utf-8")):
    clusters.setdefault(row["query"].lower(), row["cluster"])

totals = defaultdict(int)
with open("docs/research/search-data/QUERIES-EXPORT.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        q = row["Top queries"].lower()
        if any(b in q for b in ("creative activities", "creativeactivities", "golden moments")):
            continue
        totals[clusters.get(q, "other")] += int(row["Impressions"].replace(",", ""))
for cluster, impressions in sorted(totals.items(), key=lambda kv: -kv[1]):
    print(cluster, impressions)
```

The sketch needs a small change if the export uses another UI language or a different file encoding. Check the header before running it.

## Part C. Verification log (maintainer fills in)

| Date | Item | Result | Who | Where the file is |
| --- | --- | --- | --- | --- |
| | Keyword Planner US English export | | | |
| | Contrasting market chosen | | | |
| | Google Trends export (US) | | | |
| | SERP audit (15 clusters) | | | |
| | Search Console Domain property verified | | | |
| | Search Console sitemap submitted | | | |
| | Bing Webmaster site verified | | | |
| | Bing sitemap submitted | | | |
| | Baseline window and nonbranded totals recorded | | | |
| | S1 growth threshold set (before launch) | | | |

SEO-004 asks for verification status "in the metrics file". There is no separate metrics file; the nearest is [17-metrics-and-evidence.md](../specs/global/17-metrics-and-evidence.md). The maintainer decides whether to copy the log there.

## What this runbook does not cover

- The 10 caregiver interviews named in the roadmap's Stage 0 record. They need recruitment and consent; see the [usability protocol](s1-usability-protocol.md).
- Any new page or hub. Those follow the demand record and [SEO-003](../specs/global/12-search-geo-distribution.md) (URL contract).
- Other search engines or AI answer engines. Their referrals are tracked under SEO-020 and are not part of this baseline.
