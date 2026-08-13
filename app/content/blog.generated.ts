// Generated from canonical blog MDX frontmatter. Do not edit by hand.
import type { BlogPost } from "~/content/blog"

export const blogPosts = [
  {
    slug: "governance-native-engineering-control-plane",
    status: "published",
    title: "The Missing Layer in Agentic Development: Precise Governance",
    description:
      "AI can generate and review code, and CI/CD can verify executable behavior. Agentic systems still need a precise policy layer that decides what evidence and authority an action requires.",
    date: "2026-05-18",
    updatedAt: "2026-08-11",
    excerpt:
      "AI review provides judgment and CI/CD provides executable evidence. Precise governance determines which assurance is sufficient for a proposed consequence and what authority may follow.",
    tags: [
      "ai-governance",
      "anthesis",
      "delivery-governance",
      "assurance",
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
    slug: "intent-is-security-state",
    status: "published",
    title: "Intent Is Security State, Not Conversation History",
    description:
      "Agentic systems need explicit, versioned current-intent state so policy decisions, approvals, capabilities, and verification cannot silently outlive the user intent that justified them.",
    date: "2026-08-12",
    excerpt:
      "Conversation history can explain how an agent got here, but consequential authority should bind the exact current intent state the user has actually accepted.",
    tags: [
      "ai-governance",
      "anthesis",
      "authorization",
      "assurance",
      "architecture-notes",
    ],
    relatedSlugs: [
      "governance-native-engineering-control-plane",
      "replayability-is-a-governance-problem",
    ],
    series: {
      slug: "governance-native-engineering",
      order: 2,
    },
  },
  {
    slug: "replayability-is-a-governance-problem",
    status: "published",
    title: "Replayability Is a Governance Problem",
    description:
      "Replayability in AI-native systems is not just reproducibility engineering. It is governance infrastructure.",
    date: "2026-05-18",
    excerpt:
      "Replayability becomes an evidence problem when providers change, models mutate, routing shifts, retention windows expire, and metadata disappears.",
    tags: ["ai-governance", "replayability", "anthesis", "architecture-notes"],
    relatedSlugs: [
      "governance-native-engineering-control-plane",
      "intent-is-security-state",
      "recursive-governance-and-agent-workflows",
    ],
    series: {
      slug: "governance-native-engineering",
      order: 3,
    },
  },
  {
    slug: "recursive-governance-and-agent-workflows",
    status: "published",
    title: "Recursive Governance and Agent Workflows",
    description:
      "Recursive and hierarchical agent systems require governance boundaries, replay semantics, and observable execution surfaces.",
    date: "2026-05-18",
    updatedAt: "2026-08-03",
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
      "intent-is-security-state",
      "replayability-is-a-governance-problem",
    ],
    series: {
      slug: "governance-native-engineering",
      order: 4,
    },
  },
  {
    slug: "secure-platform-integration-is-not-plumbing",
    status: "published",
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
    relatedSlugs: [
      "ai-pipelines-need-control-boundaries",
      "software-layers-are-risk-boundaries",
    ],
    series: {
      slug: "architecture-control-boundaries",
      order: 1,
    },
  },
  {
    slug: "ai-pipelines-need-control-boundaries",
    status: "published",
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
    relatedSlugs: [
      "secure-platform-integration-is-not-plumbing",
      "software-layers-are-risk-boundaries",
    ],
    series: {
      slug: "architecture-control-boundaries",
      order: 2,
    },
  },
  {
    slug: "software-layers-are-risk-boundaries",
    status: "published",
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
    relatedSlugs: [
      "secure-platform-integration-is-not-plumbing",
      "ai-pipelines-need-control-boundaries",
    ],
    series: {
      slug: "architecture-control-boundaries",
      order: 3,
    },
  },
] satisfies BlogPost[]
