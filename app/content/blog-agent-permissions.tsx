import { MermaidDiagram } from "~/components"
import type { BlogPost } from "~/content/blog"

const agentPermissionDesignContent = () => (
  <>
    <section className="space-y-4">
      <h2>Autonomy turns permissions into architecture</h2>
      <p>
        Autonomous coding agents are useful because they can keep working while a
        developer is not pressing every button. That same property changes the
        permission model. A tool that can edit files, run commands, open pull
        requests, update dependencies, or touch deployment configuration is no
        longer just a text assistant. It is an actor inside the delivery system.
      </p>
      <div className="article-callout">
        <p>
          The useful boundary is not human versus AI. The useful boundary is
          reversible versus irreversible, local versus shared, inspectable versus
          opaque, and advisory versus state-changing.
        </p>
      </div>
      <p>
        Permission prompts are a reasonable starting point, but they are not a
        durable architecture by themselves. They interrupt flow at the moment of
        action, when the developer may have the least context. A better model
        treats permission as a lightweight control plane around the agent.
      </p>
    </section>

    <MermaidDiagram
      title="Agent permission control path"
      caption="Safe defaults keep routine work moving; escalation and evidence boundaries protect state-changing actions."
      chart={`flowchart TD
  A[Developer intent] --> B[Task scope]
  B --> C{Action class}
  C -->|read or inspect| D[Allow with audit]
  C -->|local reversible edit| E[Allow in workspace]
  C -->|shared state change| F[Require explicit approval]
  C -->|destructive or secret-bearing| G[Block or isolate]
  E --> H[Diff and test evidence]
  F --> H
  G --> I[Explain refusal or safer path]
  H --> J[Review checkpoint]
  J --> K{Promote?}
  K -->|yes| L[Commit, PR, deploy, or write-back]
  K -->|no| M[Revise or discard]`}
    />

    <section className="space-y-4">
      <h2>A small permission taxonomy</h2>
      <p>
        The model can stay small. Most agent actions fit into a handful of
        buckets that are easier to reason about than an endless list of commands.
      </p>
      <table>
        <thead>
          <tr>
            <th>Action class</th>
            <th>Default</th>
            <th>Examples</th>
            <th>Control</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Read and inspect</td>
            <td>Allow</td>
            <td>Search code, read docs, inspect logs, explain a diff</td>
            <td>Audit source paths and context used</td>
          </tr>
          <tr>
            <td>Local reversible edit</td>
            <td>Allow inside scope</td>
            <td>Edit workspace files, add tests, format code</td>
            <td>Constrain to task paths, require diff review</td>
          </tr>
          <tr>
            <td>Local execution</td>
            <td>Allow selectively</td>
            <td>Run tests, typecheck, lint, build</td>
            <td>Restrict network, secrets, and long-running commands</td>
          </tr>
          <tr>
            <td>Shared state change</td>
            <td>Escalate</td>
            <td>Push branches, open PRs, update issues, modify cloud state</td>
            <td>Require explicit approval and durable evidence</td>
          </tr>
          <tr>
            <td>Destructive or secret-bearing</td>
            <td>Block by default</td>
            <td>Delete data, rotate credentials, expose env, alter production</td>
            <td>Use isolation, break-glass approval, or manual execution</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section className="space-y-4">
      <h2>Why command gating is not enough</h2>
      <p>
        A common permission pattern is to classify shell commands as safe or
        dangerous. That helps, but it misses an important equivalence problem:
        agents can often achieve the same state change through another path.
        Deleting a resource through a CLI, editing a state file, changing a
        manifest, or opening a pull request that triggers automation may all
        produce similar operational effects.
      </p>
      <p>
        The permission check therefore needs to classify the intended effect, not
        only the tool invocation. Otherwise the system governs one doorway while
        leaving adjacent doors open.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Review latency is a signal, not just a cost</h2>
      <p>
        Agent-authored pull requests create a second pressure point. When agents
        produce security-sensitive changes, reviewers tend to slow down because
        they need to understand both the patch and the reasoning path that led to
        it. That delay should not be treated only as inefficiency. It is feedback
        that the evidence package is insufficient.
      </p>
      <p>
        A strong agent workflow should make review cheaper by preserving the
        task scope, commands run, files touched, tests executed, policy gates
        crossed, and unresolved assumptions. The goal is not to remove human
        review. The goal is to make the review boundary legible.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Minimum viable permission design</h2>
      <ul>
        <li>
          Start every task with a declared scope: repository, branch, directories,
          allowed tools, network posture, and expected output.
        </li>
        <li>
          Classify actions by effect: read, local edit, local execution, shared
          write, destructive action, or secret-bearing action.
        </li>
        <li>
          Allow routine reversible work by default, but keep it inside the scoped
          workspace and require a diff before promotion.
        </li>
        <li>
          Escalate shared state changes such as pushing branches, opening pull
          requests, updating infrastructure, or writing to external systems.
        </li>
        <li>
          Block destructive or secret-bearing actions unless the environment is
          isolated and the approval path is explicit.
        </li>
        <li>
          Emit an audit envelope that records intent, action class, tools used,
          commands run, files changed, tests executed, approvals, and residual
          risks.
        </li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2>Operational rule of thumb</h2>
      <p>
        The more an action changes shared state, the more the system should shift
        from autonomy toward approval, evidence, and replayability. The more an
        action stays local, reversible, and inspectable, the more autonomy is
        reasonable.
      </p>
      <p>
        This keeps the developer experience practical. Agents can still do the
        boring work: read, edit, test, summarize, and prepare changes. Humans stay
        attached to the promotion boundary where code turns into shared system
        state.
      </p>
    </section>

    <section className="space-y-4">
      <h2>Source notes</h2>
      <p>
        This note was prompted by public discussion of Claude Code auto-permission
        modes and recent research on agentic pull request review. The specific
        takeaway is broader than any one tool: permission systems for coding
        agents need effect-aware control, not only prompt discipline or command
        classification.
      </p>
      <ul>
        <li>
          <a href="https://arxiv.org/abs/2604.04978">
            Measuring the Permission Gate: A Stress-Test Evaluation of Claude
            Code&apos;s Auto Mode
          </a>
        </li>
        <li>
          <a href="https://arxiv.org/abs/2601.00477">
            Security in the Age of AI Teammates: An Empirical Study of Agentic
            Pull Requests on GitHub
          </a>
        </li>
      </ul>
    </section>
  </>
)

export const agentPermissionBlogPosts: BlogPost[] = [
  {
    slug: "permission-design-for-autonomous-coding-agents",
    title: "Permission Design for Autonomous Coding Agents",
    description:
      "A lightweight permission model for coding agents that separates safe-by-default work from approval-gated shared state changes.",
    date: "2026-06-26",
    excerpt:
      "Autonomous coding agents need effect-aware permissions: safe defaults for reversible local work, escalation for shared state, audit envelopes, destructive-action gates, and review checkpoints.",
    tags: [
      "agentic-coding",
      "developer-tooling",
      "secure-sdlc",
      "delivery-governance",
      "architecture-notes",
    ],
    relatedSlugs: [
      "ai-pipelines-need-control-boundaries",
      "governance-native-engineering-control-plane",
      "replayability-is-a-governance-problem",
    ],
    Content: agentPermissionDesignContent,
  },
]
