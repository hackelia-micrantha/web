import { MermaidDiagram } from "~/components"
import type { BlogPost } from "~/content/blog"

const governanceNativeEngineeringContent = () => (
  <>
    <section className="space-y-4">
      <h2>Generated code changes the control plane</h2>
      <p>
        AI-native engineering creates a control-plane problem. Generated code can
        increase implementation throughput, but without intent capture,
        execution evidence, review boundaries, replayability guarantees, and
        human comprehension loops, organizations accumulate technical,
        cognitive, and intent debt faster than they can repay it.
      </p>
      <div className="article-callout">
        <p>
          The bottleneck is shifting from whether agents can produce code to
          whether organizations can still govern, review, explain, and safely
          change the systems agents help create.
        </p>
      </div>
    </section>

    <MermaidDiagram
      title="AI-native engineering control plane"
      caption="Generation increases throughput; governance preserves intent, evidence, and reviewability."
      chart={`flowchart TD
  A[Human intent] --> B[Policy and review boundaries]
  B --> C[Agent or model execution]
  C --> D[Generated change]
  D --> E[Evidence and replay envelope]
  E --> F[Human comprehension loop]
  F --> B`}
    />

    <section className="space-y-4">
      <h2>The bottleneck has moved</h2>
      <p>
        The bottleneck is no longer purely implementation throughput. It is now
        increasingly governance, replayability, operational trust,
        organizational memory, reviewability, and comprehension preservation.
      </p>
      <p>
        Transport-compatible APIs and interchangeable model providers create
        operational flexibility. They do not create governance equivalence. A
        local model, an enterprise-hosted provider, a distributed inference
        fabric, and a public shared service can expose similar APIs while
        carrying very different trust, retention, locality, and replayability
        properties.
      </p>
    </section>

    <section className="space-y-4">
      <h2>The governance surface</h2>
      <p>
        Inference-provider selection is not merely infrastructure configuration.
        It is a governance decision involving locality, retention,
        replayability, evidence quality, trust boundaries, and policy
        constraints.
      </p>
      <p>
        The same applies to prompts, tool access, execution plans, review gates,
        workflow composition, and write-back operations. These are not incidental
        implementation details. They are control surfaces.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Anthesis direction</h2>
      <p>
        Anthesis treats prompts, execution, provider routing, replay evidence,
        workflow composition, approvals, and policy evaluation as explicit
        governance surfaces. The point is not to eliminate agents. The point is
        to ensure humans remain capable of review, replay, intervention,
        attribution, and governance while agents accelerate execution.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Draft thesis</h2>
      <p>
        The next generation of engineering systems may differentiate less on raw
        generation quality and more on governance clarity, replayability,
        organizational comprehensibility, bounded autonomy, evidence quality,
        and intent preservation.
      </p>
      <p>
        AI-native engineering therefore becomes a systems-governance discipline,
        not merely a prompting discipline.
      </p>
    </section>
  </>
)

const replayabilityGovernanceContent = () => (
  <>
    <section className="space-y-4">
      <h2>Determinism is not the whole problem</h2>
      <p>
        Most conversations around AI reproducibility focus on determinism. That
        matters, but deterministic replay is only one part of the problem. The
        larger issue is governance: whether an organization can explain what
        happened, why it happened, under whose authority it happened, and what
        evidence still exists to support that claim.
      </p>
      <div className="article-callout">
        <p>
          Replayability in AI-native systems is not just reproducibility
          engineering. It is governance infrastructure.
        </p>
      </div>
    </section>

    <MermaidDiagram
      title="Replayability as evidence lifecycle"
      caption="Replay confidence depends on captured evidence and decays as provider and runtime facts expire."
      chart={`flowchart TD
  A[Execution request] --> B[Provider routing decision]
  B --> C[Model response]
  C --> D[Replay envelope]
  D --> E[Audit or review]
  D --> F[Evidence decay]
  F --> G{Replay claim still valid?}
  G -->|yes| E
  G -->|no| H[Downgrade replayability claim]`}
    />

    <section className="space-y-4">
      <h2>Replayability vs reproducibility</h2>
      <p>
        Traditional software systems often assume identical binaries, stable
        execution environments, deterministic inputs, and recoverable runtime
        state. AI systems violate many of those assumptions.
      </p>
      <p>
        Providers change. Models mutate. Routing changes. Retention windows
        expire. Metadata disappears. As a result, replayability becomes an
        evidence problem, not only a runtime problem.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Replayability ceilings</h2>
      <p>
        Different inference providers support different replayability ceilings.
        A local deterministic runtime and a shared external provider may expose
        compatible APIs while offering radically different replay guarantees.
      </p>
      <p>
        Replayability must therefore be explicit, policy-aware, evidence-backed,
        and surfaced to governance systems rather than hidden behind SDK
        abstractions.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Replayability decay</h2>
      <p>
        Replayability is not static. It decays over time as models are replaced,
        provider attestations expire, evidence is garbage-collected, execution
        metadata disappears, and retention windows close.
      </p>
      <p>
        Governance systems should model that decay explicitly. A system should
        not silently preserve a stronger replayability claim after the evidence
        required to support it has expired.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Anthesis perspective</h2>
      <p>
        Anthesis treats replayability as a first-class governance surface.
        Replay evidence is attached to workflow execution, provider routing,
        execution lineage, policy evaluation, and governance signals.
      </p>
      <p>
        The goal is not perfect determinism. The goal is bounded explainability
        and attributable execution.
      </p>
    </section>
  </>
)

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
          A workflow cannot claim stronger governance properties than the weakest
          materially contributing execution boundary.
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
      <p>
        Replayability therefore propagates across execution lineage.
      </p>
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
    tags: ["ai-governance", "anthesis", "delivery-governance", "architecture-notes"],
    relatedSlugs: [
      "replayability-is-a-governance-problem",
      "recursive-governance-and-agent-workflows",
    ],
    Content: governanceNativeEngineeringContent,
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
    Content: replayabilityGovernanceContent,
  },
  {
    slug: "recursive-governance-and-agent-workflows",
    title: "Recursive Governance and Agent Workflows",
    description:
      "Recursive and hierarchical agent systems require governance boundaries, replay semantics, and observable execution surfaces.",
    date: "2026-05-18",
    excerpt:
      "Recursive systems can expand execution depth, authority propagation, context contamination, replay ambiguity, and provenance collapse faster than traditional orchestration can govern.",
    tags: ["ai-governance", "recursive-systems", "anthesis", "architecture-notes"],
    relatedSlugs: [
      "governance-native-engineering-control-plane",
      "replayability-is-a-governance-problem",
    ],
    Content: recursiveGovernanceContent,
  },
]
