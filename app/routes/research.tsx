import { useState } from "react"
import type { MetaFunction } from "@remix-run/node"
import { PageTitle } from "~/components"
import { ExternalLink } from "~/components/external-link"
import {
  researchIndex,
  researchIndexSource,
} from "~/data/research-index.generated.js"
import { buildCollectionPageStructuredData, buildPageMeta } from "~/utils/seo"

const description =
  "Explore Micrantha's dated research reading index, selected engineering papers, and assessment limitations."

const { coverage, featured, ranking, domains } = researchIndex
const themes = [...new Set(featured.map((entry) => entry.theme))].sort()
const totals = [
  { label: "Tracked records", value: coverage.tracked },
  { label: "Marked reviewed", value: coverage.marked_reviewed },
  {
    label: "Editorial candidates screened",
    value: ranking.screened_candidates,
  },
  { label: "Featured selections", value: featured.length },
]

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Research",
    description,
    path: "/research",
  })

export const handle = {
  structuredData: buildCollectionPageStructuredData({
    name: "Research",
    description,
    path: "/research",
    items: featured.map((entry) => ({
      name: entry.title,
      description: entry.takeaway,
      url: entry.source_url,
    })),
  }),
}

export default function ResearchRoute() {
  const [theme, setTheme] = useState("")
  const entries = featured.filter((entry) => !theme || entry.theme === theme)

  return (
    <div className="space-y-10">
      <PageTitle title="Research" subtitle={description} />

      <section
        aria-labelledby="coverage-heading"
        className="editorial-panel space-y-4 px-6 py-6"
      >
        <p className="meta-kicker">
          Edition{" "}
          <time dateTime={researchIndex.as_of}>{researchIndex.as_of}</time>
        </p>
        <h2
          id="coverage-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          Research coverage
        </h2>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {totals.map(({ label, value }) => (
            <div key={label} className="min-w-0 space-y-1">
              <dt className="text-sm font-medium text-slate-700">{label}</dt>
              <dd className="text-3xl font-semibold tabular-nums text-slate-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="page-copy-sm">
          {coverage.review_status_completion_pct}% marked reviewed;{" "}
          {coverage.triaged} triaged;{" "}
          {coverage.reviewed_with_complete_scores} marked-reviewed records have
          complete valid scores; {coverage.reviewed_without_complete_scores} lack
          complete valid scores.
        </p>
        <p className="page-copy-sm">{coverage.definition}</p>
        <h3 className="text-lg font-semibold">Selected research domains</h3>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {domains.map(({ name, count }) => (
            <div key={name}>
              <dt className="text-sm text-slate-700">{name}</dt>
              <dd className="text-xl font-semibold tabular-nums">{count}</dd>
            </div>
          ))}
        </dl>
        <p className="page-copy-sm">{researchIndex.domain_definition}</p>
      </section>

      <section aria-labelledby="ranking-heading" className="space-y-4">
        <h2
          id="ranking-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          Ranked editorial selections
        </h2>
        <p className="page-copy-sm">{ranking.selection_note}</p>
        <p className="page-copy-sm">
          Target: {ranking.target_selection_size} from{" "}
          {ranking.screened_candidates} screened candidates. {featured.length}{" "}
          included with cutoff ties at {ranking.cutoff_score}/100.{" "}
          {ranking.tie_rule}
        </p>
        <details className="editorial-panel space-y-3 px-6 py-4">
          <summary className="cursor-pointer font-semibold">
            How papers are ranked
          </summary>
          <p className="page-copy-sm">{ranking.method}</p>
          <p className="page-copy-sm">{ranking.score_anchors}</p>
          <p className="page-copy-sm">{ranking.reproduction_note}</p>
        </details>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="research-theme" className="text-sm font-semibold">
            Filter by topic
          </label>
          <select
            id="research-theme"
            className="max-w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option value="">All topics</option>
            {themes.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <p className="text-sm text-slate-700" role="status">
            {entries.length} of {featured.length} selections
          </p>
        </div>
        <ol className="list-none space-y-4">
          {entries.map((entry) => (
            <li
              key={entry.id}
              data-research-entry={entry.id}
              data-rank={entry.rank}
              className="editorial-panel min-w-0 space-y-3 px-5 py-5 md:px-6"
            >
              <p className="meta-kicker">
                Rank {entry.rank} · {entry.score}/100 · {entry.theme}
              </p>
              <h3 className="break-words text-xl font-semibold tracking-tight text-slate-900">
                <ExternalLink href={entry.source_url}>
                  {entry.title}
                </ExternalLink>
              </h3>
              <p className="text-sm text-slate-700">
                {entry.authors} · Source date {entry.source_date}
              </p>
              <p className="text-sm text-slate-700">
                Assessed{" "}
                <time dateTime={entry.assessed_on}>{entry.assessed_on}</time>
                {" · "}
                {entry.review_basis}
              </p>
              <p className="page-copy-sm">
                <strong>Engineering takeaway: </strong>
                {entry.takeaway}
              </p>
              <p className="page-copy-sm">
                <strong>Author-reported evidence: </strong>
                {entry.evidence}
              </p>
              <p className="page-copy-sm">
                <strong>Limitations: </strong>
                {entry.limitation}
              </p>
              <p className="page-copy-sm">
                <strong>Independent execution: </strong>
                Not performed for this assessment.
              </p>
              <details className="space-y-2">
                <summary className="cursor-pointer font-semibold">
                  Editorial scoring rationale
                </summary>
                <p className="page-copy-sm">{entry.rationale}</p>
                <p className="page-copy-sm">
                  Momentum {entry.components.momentum}, novelty{" "}
                  {entry.components.novelty}, evidence{" "}
                  {entry.components.evidence}, practicality{" "}
                  {entry.components.practical}, long-term value{" "}
                  {entry.components.long_term} (each out of 5).
                </p>
              </details>
              {entry.review_url ? (
                <ExternalLink
                  className="article-meta-link"
                  href={entry.review_url}
                >
                  Full community review
                </ExternalLink>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="research-source-heading" className="space-y-3">
        <h2 id="research-source-heading" className="text-xl font-semibold">
          Source and attribution
        </h2>
        <p className="page-copy-sm">
          <ExternalLink
            className="article-meta-link"
            href={researchIndexSource}
          >
            Version-pinned community research index (JSON)
          </ExternalLink>
          {" · "}
          {researchIndex.attribution} ·{" "}
          <ExternalLink
            className="article-meta-link"
            href={researchIndex.license_url}
          >
            {researchIndex.license}
          </ExternalLink>
        </p>
        <p className="page-copy-sm">{researchIndex.rights_note}</p>
        {researchIndex.adaptations.map((adaptation) => (
          <p key={adaptation.id} className="page-copy-sm">
            Adapted from{" "}
            <ExternalLink
              className="article-meta-link"
              href={adaptation.source_url}
            >
              {adaptation.title}
            </ExternalLink>
            {" by "}
            {adaptation.attribution} ({adaptation.license}). {adaptation.change}
          </p>
        ))}
      </section>
    </div>
  )
}
