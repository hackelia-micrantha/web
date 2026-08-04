import type { BlogPost } from "~/content/blog"

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
  },
]
