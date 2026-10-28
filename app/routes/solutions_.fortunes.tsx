import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { PageTitle } from "~/components"
import { buildPageMeta } from "~/utils/seo"

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Fortunes & Quotes — Roadmap",
    description:
      "Planned semantic quote search, community contributions, AI-generated fortunes, and specialist small-model research at Micrantha.",
    path: "/solutions/fortunes",
  })

const plannedCapabilities = [
  {
    title: "Discover by meaning",
    description:
      "Explore quotes and fortunes by theme and intent, not just matching words. The proposed design keeps embeddings and vector search inside a versioned SQLite snapshot, with lexical search available alongside it.",
  },
  {
    title: "Write and contribute",
    description:
      "People will be able to submit their own original quotes, jokes, aphorisms, and fortunes. Contributions are intended to include authorship credit and a review process; submitting does not make content public automatically.",
  },
  {
    title: "Generate original fortunes with AI",
    description:
      "An optional creative tool will draft new fortunes from a topic or mood. AI-generated work will be clearly labeled, checked for inappropriate or copied material, and reviewed before it enters the public collection.",
  },
  {
    title: "Explore specialist small language models",
    description:
      "An experimental training track will compare prompting an existing small model, fine-tuning a specialist model, and building a tiny transformer for learning and research. Predictive representation learning, including JEPA-style approaches, is exploratory rather than a promised product feature.",
  },
]

const FortunesRoadmap = () => (
  <div>
    <PageTitle
      title="Fortunes & Quotes"
      subtitle="A public roadmap for discovering, contributing, and creating short-form wisdom and humor."
    />

    <div className="max-w-4xl space-y-10">
      <section className="space-y-4">
        <p className="font-semibold">Roadmap · Planned and experimental</p>
        <p>
          Fortunes began as a way to bring classic UNIX fortunes to the web and
          Slack. The next direction is a broader quote and fortune collection
          that supports meaning-based discovery and original contributions.
        </p>
        <p>
          This page describes proposals and experiments, not features already
          available or committed release dates. The existing service remains
          available at{" "}
          <a className="underline" href="https://fortunes.micrantha.com">
            fortunes.micrantha.com
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="roadmap-capabilities" className="space-y-5">
        <h2 id="roadmap-capabilities" className="text-2xl font-semibold">
          What we want to build
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {plannedCapabilities.map((capability) => (
            <article
              key={capability.title}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <h3 className="text-lg font-semibold">{capability.title}</h3>
              <p className="mt-3">{capability.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="roadmap-process" className="space-y-4">
        <h2 id="roadmap-process" className="text-2xl font-semibold">
          From an idea to a published fortune
        </h2>
        <p>
          Human-authored and AI-generated content will have different, visible
          provenance. Both will pass through review before publication. Only
          approved content is intended to appear in the public collection and
          its semantic-search index.
        </p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Write an original fortune or generate an AI-labeled draft.</li>
          <li>
            Check attribution, originality, safety, and contributor rights.
          </li>
          <li>Review and approve the content for publication.</li>
          <li>
            Publish a versioned collection and rebuild its SQLite vector index.
          </li>
          <li>
            Make approved items discoverable by category, keyword, and meaning.
          </li>
        </ol>
      </section>

      <section aria-labelledby="roadmap-research" className="space-y-4">
        <h2 id="roadmap-research" className="text-2xl font-semibold">
          Small-model training research
        </h2>
        <p>
          The goal is to study whether a compact language model can develop a
          distinctive ability to write concise, original, context-aware
          fortunes. We plan to compare an unmodified baseline, supervised
          fine-tuning, and a small from-scratch training exercise.
        </p>
        <p>
          Training data must have appropriate rights and provenance. Research
          outcomes will be evaluated for quality, originality, memorization,
          and safety. User submissions and private conversations will not be
          used for training by default.
        </p>
      </section>

      <section aria-labelledby="roadmap-principles" className="space-y-4">
        <h2 id="roadmap-principles" className="text-2xl font-semibold">
          Design principles
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Keep existing fortune behavior usable as new capabilities are added.
          </li>
          <li>
            Distinguish human-authored, curated, and AI-generated content.
          </li>
          <li>
            Keep the public reading path lightweight and inexpensive to operate.
          </li>
          <li>
            Require review before community or generated content is published.
          </li>
          <li>
            Make privacy, attribution, moderation, and content rights explicit.
          </li>
          <li>
            Measure retrieval and generation quality before making product claims.
          </li>
        </ul>
        <p className="pt-2">
          <Link className="underline" to="/solutions">
            Back to Solutions
          </Link>
        </p>
      </section>
    </div>
  </div>
)

export default FortunesRoadmap
