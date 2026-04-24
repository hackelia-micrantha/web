import type { ReactNode } from "react"
import { Link } from "@remix-run/react"

export type BlogPost = {
  slug: string
  title: string
  description: string
  date: string
  excerpt: string
  tags: string[]
  teaser: string
  linkedinShort: string
  linkedinTechnical: string
  relatedSlugs: string[]
  Content: () => ReactNode
}

export const BLOG_TITLE = "Architecture Notes"
export const BLOG_DESCRIPTION =
  "Architecture notes on secure platform integration, delivery governance, AI-assisted systems, and long-lived software design."

const PostLink = ({
  slug,
  children,
}: {
  slug: string
  children: ReactNode
}) => <Link to={`/blog/${slug}`}>{children}</Link>

const securePlatformIntegrationContent = () => (
  <>
    <section className="space-y-4">
      <h2>Problem statement</h2>
      <p>
        Integration work is often treated like a narrow technical chore: map a
        few fields, move some records, and declare the systems connected. That
        view is too small. The integration layer is where identity gets
        translated, workflow state changes hands, upstream data quality becomes
        visible, and recovery paths either exist or do not.
      </p>
      <p>
        In modernization programs, this layer is also where operating risk
        accumulates. The moment multiple systems share responsibility for a
        process, the integration path becomes a control surface for correctness,
        observability, and operational recovery.
      </p>
      <div className="article-callout">
        <p>
          Secure platform integration is not plumbing. It is the place where
          data contracts, trust boundaries, workflow semantics, and failure
          handling must become explicit.
        </p>
      </div>
    </section>

    <section className="space-y-4">
      <h2>Why integration fails in modernization programs</h2>
      <p>
        Programs usually fail here for ordinary reasons, not exotic ones. Teams
        assume the source systems are better defined than they are. A delivery
        plan focuses on feature parity while leaving state reconciliation,
        retries, identity mapping, and operator visibility for later. The result
        is an integration layer that moves data but cannot explain whether the
        business process is actually healthy.
      </p>
      <p>
        This gets worse when the integration path is built inside a single
        vendor implementation mindset. Once orchestration rules, security
        choices, and business corrections collapse into one tool, replacement
        becomes expensive and defects become harder to isolate.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Layered control model</h2>
      <p>
        The useful pattern is a layered one: contract and identity at the
        ingress boundary, workflow mediation in the application layer, durable
        event and observability records around the transaction, and explicit
        recovery tooling for operators.
      </p>
      <pre>
        <code>{`flowchart TD
    A[Channels and Source Systems] --> B[Interface Boundary
    Validate schema
    Authenticate caller
    Assign correlation IDs]
    B --> C[Integration Application Layer
    Map contracts
    Enforce workflow rules
    Route commands and events]
    C --> D[Domain and Policy Decisions
    Eligibility
    State transitions
    Exceptions]
    C --> E[Observability and Audit
    Logs
    Metrics
    Provenance
    Replay markers]
    D --> F[Systems of Record and External Platforms]
    E --> G[Operations and Recovery]`}</code>
      </pre>
      <p>
        Even as plain text, the diagram is useful because it forces the
        questions that matter: where is identity asserted, where is state
        normalized, where are business decisions made, and where do operators go
        when a transaction is partial?
      </p>
    </section>

    <section className="space-y-4">
      <h2>Common failure modes</h2>
      <ul>
        <li>
          Field mapping succeeds while workflow semantics drift, so records
          exist in both systems but represent different business states.
        </li>
        <li>
          Retry logic duplicates side effects because idempotency and replay
          keys were never designed into the path.
        </li>
        <li>
          Identity and entitlement assumptions leak across systems, creating
          authorization gaps that are hard to audit later.
        </li>
        <li>
          Monitoring focuses on transport errors while silent data-quality
          failures continue downstream.
        </li>
        <li>
          Recovery depends on ad hoc scripts and institutional memory instead of
          designed operator workflows.
        </li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2>Practical controls</h2>
      <ul>
        <li>
          Define versioned interface contracts and keep contract validation at
          the edge rather than distributing it across consumers.
        </li>
        <li>
          Separate transport adapters from business workflow rules so the
          integration layer can survive vendor or platform change.
        </li>
        <li>
          Carry correlation IDs, provenance markers, and actor identity across
          every transaction boundary.
        </li>
        <li>
          Make idempotency, replay, and compensating actions explicit design
          features rather than operational folklore.
        </li>
        <li>
          Give operators first-class recovery tools and clear state models for
          partial failure.
        </li>
      </ul>
      <p>
        The follow-on concern is how new AI-assisted paths fit inside those same
        controls. That is the subject of{" "}
        <PostLink slug="ai-pipelines-need-control-boundaries">
          AI Pipelines Need Control Boundaries
        </PostLink>
        .
      </p>
    </section>

    <section className="space-y-4">
      <h2>Conclusion</h2>
      <p>
        Integration layers deserve architectural attention because they decide
        whether modernization produces a governable system or only a more
        complicated failure surface. When teams treat integration as a control
        boundary instead of a wiring task, they gain cleaner workflow behavior,
        better recovery, and more realistic options for future change.
      </p>
    </section>
  </>
)

const aiPipelinesControlBoundariesContent = () => (
  <>
    <section className="space-y-4">
      <h2>Start with the right mental model</h2>
      <p>
        Enterprise AI work becomes risky when the model is treated like an
        authoritative subsystem instead of a fallible component inside a larger
        delivery path.
      </p>
      <div className="article-callout">
        <p>
          AI is not the system of record. AI is an untrusted reasoning component
          operating inside a governed integration path.
        </p>
      </div>
      <p>
        That sentence changes the design. It means prompts, tool access,
        retrieval, outputs, and write-back actions all need control boundaries
        of their own.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Pre-processing</h2>
      <p>
        Input control starts before a model sees anything. Raw enterprise data
        usually needs normalization to reduce ambiguity, redaction to remove
        material the model does not need, enrichment to provide stable business
        context, and provenance markers so downstream reviewers can see what
        sources shaped the result.
      </p>
      <ul>
        <li>
          Normalize structure and terminology so prompts do not depend on
          unstable source formatting.
        </li>
        <li>
          Redact sensitive fields when they are not necessary for the reasoning
          task.
        </li>
        <li>
          Enrich with identifiers, policy context, and known workflow state.
        </li>
        <li>
          Attach provenance so outputs can be inspected against real evidence.
        </li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2>MCP and tool boundary</h2>
      <p>
        Tool access should be scoped like any other privileged interface.
        Exposing a broad tool surface because a model might find it useful is
        the wrong default. The model should receive only the tools, methods, and
        data slices required for the current workflow step.
      </p>
      <ul>
        <li>Scope access to the task and actor, not the whole platform.</li>
        <li>
          Require authorization at the tool boundary, not only in prompts.
        </li>
        <li>Audit tool invocations and carry the calling workflow identity.</li>
        <li>
          Treat MCP or similar tool channels as integration surfaces subject to
          the same control design as any other API.
        </li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2>AI execution</h2>
      <p>
        Inside the execution zone, retrieval, model or agent selection, and tool
        calls are still just intermediate reasoning steps. They are useful, but
        they should not be confused with final system action. Enterprise
        architectures need a visible boundary between the reasoning process and
        the transaction that affects a real workflow.
      </p>
      <p>
        This is where a layered architecture matters. The same separation
        described in{" "}
        <PostLink slug="software-layers-are-risk-boundaries">
          Software Layers Are Risk Boundaries
        </PostLink>{" "}
        keeps AI-specific logic from leaking directly into systems of record.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Post-processing and approval</h2>
      <p>
        Before anything is written back, the result needs to be validated,
        scored, compared with expected structures, and, where necessary, held
        for approval. This is the difference between an assistant and an
        uncontrolled actor.
      </p>
      <ul>
        <li>Validate schema, policy requirements, and required fields.</li>
        <li>
          Score confidence or rule conformance using deterministic checks rather
          than model self-assessment alone.
        </li>
        <li>
          Diff proposed changes against current records so reviewers can see the
          exact effect.
        </li>
        <li>
          Require explicit approval when the action changes regulated workflow,
          status, or customer-visible records.
        </li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2>Controlled write-back</h2>
      <p>
        The write-back step should look like a normal governed integration:
        authorized actor, validated payload, logged decision, and a durable
        trace of what was changed. If that control surface does not exist, the
        pipeline is not ready for enterprise use.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Threat and failure modes</h2>
      <table>
        <thead>
          <tr>
            <th>Failure mode</th>
            <th>What usually causes it</th>
            <th>Control response</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Over-broad tool access</td>
            <td>Convenience-driven integration and prompt-only policy</td>
            <td>Scope tools by workflow, enforce authorization, audit calls</td>
          </tr>
          <tr>
            <td>Unverifiable output</td>
            <td>Missing provenance and no deterministic validation</td>
            <td>Attach sources, run schema checks, retain review traces</td>
          </tr>
          <tr>
            <td>Unsafe write-back</td>
            <td>Model output sent directly to systems of record</td>
            <td>Require approval gates and controlled adapter writes</td>
          </tr>
          <tr>
            <td>Prompt leakage of sensitive data</td>
            <td>Skipping normalization and redaction upstream</td>
            <td>Pre-process inputs and minimize exposed fields</td>
          </tr>
          <tr>
            <td>Workflow drift</td>
            <td>AI-specific logic embedded in every consumer</td>
            <td>Keep orchestration in an application boundary</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section className="space-y-4">
      <h2>Conclusion</h2>
      <p>
        The practical goal is not to remove AI from the workflow. It is to put
        AI in a place where it can be useful without becoming the implicit owner
        of security, state, or business truth. Once the control boundaries are
        explicit, enterprise AI becomes easier to test, review, and replace.
      </p>
    </section>
  </>
)

const softwareLayersRiskBoundariesContent = () => (
  <>
    <section className="space-y-4">
      <h2>Why layers still matter</h2>
      <p>
        Layered architecture is sometimes dismissed as ceremony. In practice, it
        is one of the simplest ways to keep risk from collapsing into a single
        code path. Without layers, interface concerns, business rules,
        integration behavior, and infrastructure choices drift together until
        every change becomes a coupled change.
      </p>
      <p>
        The useful question is not whether the layers are academically pure. It
        is whether they preserve replaceability and make failure easier to
        localize.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Clients and channels</h2>
      <p>
        Mobile apps, browser clients, partner interfaces, background jobs, and
        operator tools all enter the system from different conditions. Their job
        is to collect intent and present results. They should not become the
        place where core workflow rules are defined.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Interface layer</h2>
      <p>
        The interface layer translates between external protocols and internal
        use cases. It handles transport concerns such as request validation,
        authentication context, response shaping, and correlation identifiers.
        It should not be the home of domain policy.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Application layer</h2>
      <p>
        The application layer coordinates workflows. It decides what needs to
        happen in what order, which policies apply, and which collaborators need
        to be invoked. This is where enterprise process shape belongs, including
        AI-assisted steps, approval gates, and integration sequencing.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Domain layer</h2>
      <p>
        The domain layer protects business meaning: state transitions,
        invariants, eligibility rules, and the definitions that make the system
        more than a collection of endpoints. It should remain understandable
        without reference to a UI framework, ERP connector, or model provider.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Infrastructure and adapters</h2>
      <p>
        Infrastructure is where databases, queues, vendor SDKs, ERP connectors,
        mobile platform services, and model providers live. These adapters are
        necessary, but they should remain replaceable. When they leak upward
        into policy code, vendor replacement becomes a rewrite instead of an
        integration task.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Why each layer exists</h2>
      <ul>
        <li>
          Clients and channels isolate user-facing behavior and device-specific
          constraints.
        </li>
        <li>
          The interface layer protects the system from protocol churn and input
          ambiguity.
        </li>
        <li>
          The application layer governs workflow sequencing and approvals.
        </li>
        <li>
          The domain layer preserves business rules independent of tools and
          vendors.
        </li>
        <li>
          Infrastructure and adapters keep external systems attached without
          turning them into the center of the design.
        </li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2>Why this helps in real programs</h2>
      <p>
        On mobile programs, it keeps device and channel concerns from taking
        over core business logic. In system integration and enterprise
        modernization work, it prevents a vendor interface from becoming the
        architecture. In AI-enabled workflows, it creates a safe place for
        retrieval, reasoning, and validation without promoting the model to
        system authority.
      </p>
      <p>
        It also supports replacement. A mobile client can be rebuilt, an ERP
        connector can be swapped, or an AI provider can change without forcing a
        redesign of the domain. That is the architectural payoff.
      </p>
      <p>
        The operational side of that same argument shows up in{" "}
        <PostLink slug="secure-platform-integration-is-not-plumbing">
          Secure Platform Integration Is Not Plumbing
        </PostLink>
        , where the integration layer is treated as a control surface rather
        than a transport detail.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Conclusion</h2>
      <p>
        Software layers are not only a code-organization preference. They are
        risk boundaries. They decide whether business rules stay durable,
        whether integrations remain replaceable, and whether runtime concerns
        can change without pulling the whole system apart.
      </p>
    </section>
  </>
)

export const blogPosts: BlogPost[] = [
  {
    slug: "secure-platform-integration-is-not-plumbing",
    title: "Secure Platform Integration Is Not Plumbing",
    description:
      "Why enterprise integration layers are control surfaces for workflow correctness, identity, observability, and recovery.",
    date: "2026-04-24",
    excerpt:
      "Integration layers are where identity, data quality, workflow semantics, and recovery become explicit. Treating them as plumbing is how modernization programs lose control.",
    tags: [
      "architecture-notes",
      "platform-integration",
      "delivery-governance",
      "enterprise-modernization",
    ],
    teaser:
      "Integration is not wiring between systems; it is where trust, workflow state, and recovery have to become explicit.",
    linkedinShort:
      "New in Micrantha Architecture Notes: secure platform integration is not a plumbing exercise. It is where data contracts, identity, workflow state, observability, and recovery paths stop being implied and become designed. A short note on why modernization programs usually fail here first.",
    linkedinTechnical:
      "A practical integration architecture needs more than field mapping. The boundary has to validate contracts, preserve identity, route workflow semantics, expose provenance, and support replay or recovery when transactions go partial. I wrote up a compact architecture note on why enterprise integration layers should be treated as control surfaces, not transport detail.",
    relatedSlugs: [
      "ai-pipelines-need-control-boundaries",
      "software-layers-are-risk-boundaries",
    ],
    Content: securePlatformIntegrationContent,
  },
  {
    slug: "ai-pipelines-need-control-boundaries",
    title: "AI Pipelines Need Control Boundaries",
    description:
      "Enterprise AI should be treated as an untrusted reasoning component inside a governed integration path.",
    date: "2026-04-24",
    excerpt:
      "Enterprise AI becomes safer and more useful when normalization, authorization, validation, and write-back controls are explicit around it.",
    tags: [
      "architecture-notes",
      "ai-governance",
      "workflow-validation",
      "secure-integration",
    ],
    teaser:
      "AI belongs inside a governed integration path, not in charge of one.",
    linkedinShort:
      "Enterprise AI needs control boundaries. The model is useful, but it is not the system of record and it should not become the implicit owner of workflow state. I wrote a short note on preprocessing, scoped tool access, validation, approval, and controlled write-back.",
    linkedinTechnical:
      "The framing I keep coming back to is simple: AI is an untrusted reasoning component operating inside a governed integration path. That pushes design effort into input normalization, redaction, provenance, scoped MCP or tool access, deterministic validation, diffing, approval, and controlled adapter writes. I pulled that into a compact architecture note with a threat table.",
    relatedSlugs: [
      "secure-platform-integration-is-not-plumbing",
      "software-layers-are-risk-boundaries",
    ],
    Content: aiPipelinesControlBoundariesContent,
  },
  {
    slug: "software-layers-are-risk-boundaries",
    title: "Software Layers Are Risk Boundaries",
    description:
      "Why layered architecture keeps business rules, integration boundaries, security decisions, and runtime concerns from collapsing into each other.",
    date: "2026-04-24",
    excerpt:
      "Layering is how mobile, integration, and AI-enabled systems stay governable when vendors, channels, and runtime concerns change around them.",
    tags: [
      "architecture-notes",
      "layered-architecture",
      "mobile-systems",
      "enterprise-architecture",
    ],
    teaser:
      "Layers matter because replaceability, security, and business meaning should not depend on the same code path.",
    linkedinShort:
      "Layered architecture is sometimes framed as style. In long-lived systems it is really a risk-control mechanism. Clients, interfaces, workflows, domain rules, and infrastructure should not collapse into one another if you expect vendor replacement, mobile evolution, or governed AI paths later.",
    linkedinTechnical:
      "When interface code, workflow orchestration, domain policy, and adapters blur together, every change becomes a coupled change. I wrote a short note on why software layers are risk boundaries, especially for mobile programs, enterprise integration, AI-assisted workflows, and future vendor replacement.",
    relatedSlugs: [
      "secure-platform-integration-is-not-plumbing",
      "ai-pipelines-need-control-boundaries",
    ],
    Content: softwareLayersRiskBoundariesContent,
  },
]

export function getBlogPosts() {
  return blogPosts
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null
}

export function getRelatedPosts(post: BlogPost) {
  return post.relatedSlugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((candidate): candidate is BlogPost => candidate !== null)
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}
