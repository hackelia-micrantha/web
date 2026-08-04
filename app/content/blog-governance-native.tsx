import { MermaidDiagram } from "~/components"
import type { BlogPost } from "~/content/blog"

const recursiveGovernanceContent = () => (
  <>
    <section className="space-y-4">
      <h2>Recursive agents need governed recursion</h2>
      <p>
        Recursive agent systems are becoming increasingly attractive.
        Hierarchical planners, reviewer trees, recursive decomposition systems,
        and latent collaboration models promise better reasoning scalability
        than flat prompting alone.
      </p>
      <p>
        But recursive systems introduce governance problems. The challenge is
        not only orchestration. It is governed recursion.
      </p>
    </section>

    <MermaidDiagram
      title="Governed recursive execution"
      caption="Recursive fan-out must preserve authority boundaries, lineage, and replay ceilings."
      chart={`flowchart TD
  A[Workflow request] --> B[Planner]
  B --> C[Bounded task A]
  B --> D[Bounded task B]
  B --> E[Reviewer]
  C --> F[Evidence]
  D --> F
  E --> F
  F --> G[Governed synthesis]
  G --> H[Human review boundary]`}
    />

    <section className="space-y-4">
      <h2>The core tension</h2>
      <p>
        Recursive systems can expand execution depth, execution fan-out,
        authority propagation, context contamination, replay ambiguity, and
        provenance collapse faster than traditional orchestration systems were
        designed to handle.
      </p>
      <div className="article-callout">
        <p>
          A workflow cannot claim stronger governance properties than the
          weakest materially contributing execution boundary.
        </p>
      </div>
    </section>

    <section className="space-y-4">
      <h2>Observable vs latent execution</h2>
      <p>
        Not all recursive execution is equally observable. Some systems expose
        explicit execution nodes, review boundaries, execution lineage, and
        structured delegation. Others operate partly in latent space or opaque
        runtime layers.
      </p>
      <p>
        Governance systems must distinguish observable execution, opaque
        execution, latent execution, and synthesized outputs without pretending
        complete introspection exists.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Replayability boundaries</h2>
      <p>
        Recursive systems complicate replayability. Advisory branches may remain
        excluded from a replay envelope, but synthesis-influencing branches
        become governance-relevant. Latent recursive execution constrains replay
        ceilings because it contributes to the delivered output without exposing
        the same evidence surface as explicit execution.
      </p>
      <p>Replayability therefore propagates across execution lineage.</p>
    </section>

    <section className="space-y-4">
      <h2>Anthesis direction</h2>
      <p>
        Anthesis treats recursive coordination as profiles over governed
        execution graphs, bounded execution expansion, evidence-linked workflow
        composition, and policy-governed delegation rather than unrestricted
        autonomous recursion.
      </p>
      <p>
        The long-term challenge is not simply building more capable recursive
        agents. It is ensuring humans remain capable of comprehension,
        intervention, replay, audit, and authority governance after recursive
        systems become operationally useful.
      </p>
    </section>
  </>
)

export const governanceNativeBlogPosts: BlogPost[] = [
  {
    slug: "governance-native-engineering-control-plane",
    title: "Governance-Native Engineering and the AI Control Plane",
    description:
      "AI-native engineering shifts the bottleneck from implementation throughput toward governance, replayability, and organizational comprehension.",
    date: "2026-05-18",
    excerpt:
      "Generated code increases throughput, but without intent capture, evidence, review boundaries, replayability guarantees, and human comprehension loops, organizations accumulate governance debt.",
    tags: [
      "ai-governance",
      "anthesis",
      "delivery-governance",
      "architecture-notes",
    ],
    relatedSlugs: [
      "replayability-is-a-governance-problem",
      "recursive-governance-and-agent-workflows",
    ],
    series: {
      slug: "governance-native-engineering",
      order: 1,
    },
  },
  {
    slug: "replayability-is-a-governance-problem",
    title: "Replayability Is a Governance Problem",
    description:
      "Replayability in AI-native systems is not just reproducibility engineering. It is governance infrastructure.",
    date: "2026-05-18",
    excerpt:
      "Replayability becomes an evidence problem when providers change, models mutate, routing shifts, retention windows expire, and metadata disappears.",
    tags: ["ai-governance", "replayability", "anthesis", "architecture-notes"],
    relatedSlugs: [
      "governance-native-engineering-control-plane",
      "recursive-governance-and-agent-workflows",
    ],
    series: {
      slug: "governance-native-engineering",
      order: 2,
    },
  },
  {
    slug: "recursive-governance-and-agent-workflows",
    title: "Recursive Governance and Agent Workflows",
    description:
      "Recursive and hierarchical agent systems require governance boundaries, replay semantics, and observable execution surfaces.",
    date: "2026-05-18",
    excerpt:
      "Recursive systems can expand execution depth, authority propagation, context contamination, replay ambiguity, and provenance collapse faster than traditional orchestration can govern.",
    tags: [
      "ai-governance",
      "recursive-systems",
      "anthesis",
      "architecture-notes",
    ],
    relatedSlugs: [
      "governance-native-engineering-control-plane",
      "replayability-is-a-governance-problem",
    ],
    series: {
      slug: "governance-native-engineering",
      order: 3,
    },
    Content: recursiveGovernanceContent,
  },
]
