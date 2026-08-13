import { expect, test } from "@playwright/test"

test("/services exposes the consultation path", async ({ page }) => {
  await page.goto("/services")

  await expect(page.getByRole("heading", { name: "Services" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Request a consultation" }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Email services@micrantha.com" }),
  ).toHaveAttribute(
    "href",
    "mailto:services@micrantha.com?subject=Consultation",
  )
  await expect(
    page.getByRole("heading", { name: "What to include" }),
  ).toBeVisible()
  await expect(
    page.getByText("the product, platform, or workflow you are building"),
  ).toBeVisible()
  await expect(
    page.getByText(
      "whether you need AI delivery, governance, mobile platform, security, or deployment support",
    ),
  ).toBeVisible()
  await expect(
    page.getByText("your timeline, constraints, and how to contact you"),
  ).toBeVisible()
})

test("/solutions exposes the current solution taxonomy", async ({ page }) => {
  await page.goto("/solutions")

  await expect(page.getByRole("heading", { name: "Solutions" })).toBeVisible()
  await expect(
    page.locator("a", {
      has: page.getByRole("heading", { name: "Dubnium", exact: true }),
    }),
  ).toHaveAttribute(
    "href",
    "https://github.com/hackelia-micrantha/dubnium-community",
  )
  await expect(
    page.locator("a", {
      has: page.getByRole("heading", { name: "Envuscator", exact: true }),
    }),
  ).toHaveAttribute("href", "https://envuscator.micrantha.com")
  await expect(
    page.getByRole("heading", { name: "Anthesis", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Fortunes Service", exact: true }),
  ).toBeVisible()
})

test("/laboratory exposes the current laboratory taxonomy", async ({
  page,
}) => {
  await page.goto("/laboratory")

  await expect(page.getByRole("heading", { name: "Laboratory" })).toBeVisible()
  await expect(
    page.locator("a", {
      has: page.getByRole("heading", {
        name: "Anthesis Governance Lab",
        exact: true,
      }),
    }),
  ).toHaveAttribute("href", "https://github.com/ryjen/anthesis-governance-lab")
  await expect(
    page.getByRole("heading", {
      name: "Dubnium Governed Agent Demo",
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: /project hyperion/i }),
  ).toHaveAttribute("href", "https://hyperion.micrantha.com")
  await expect(
    page.locator("a", {
      has: page.getByRole("heading", { name: "Bluebell", exact: true }),
    }),
  ).toHaveAttribute("href", "https://github.com/hackelia-micrantha/bluebell")
  await expect(
    page.getByRole("heading", { name: "Myosotis", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Eyespie", exact: true }),
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Compost" })).toHaveAttribute(
    "href",
    "/compost",
  )
  await expect(
    page.getByRole("heading", { name: "Project Anthesis", exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole("heading", { name: "Envuscator", exact: true }),
  ).toHaveCount(0)
})

test("/privacy retains the tailored long-form policy copy", async ({
  page,
}) => {
  await page.goto("/privacy")

  await expect(
    page.getByRole("heading", { name: "Privacy Policy", exact: true }),
  ).toBeVisible()
  await expect(page.getByText("Information Collection and Use")).toBeVisible()
  await expect(page.getByText("Cookies", { exact: true })).toBeVisible()
  await expect(page.getByText("Contact", { exact: true })).toBeVisible()
  await expect(page.getByText("fortunes.micrantha.com")).toHaveCount(0)
})

test("/security exposes the reporting path", async ({ page }) => {
  await page.goto("/security")

  await expect(page.getByRole("heading", { name: "Security" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "security@micrantha.com" }),
  ).toHaveAttribute("href", "mailto:security@micrantha.com")
  await expect(page.getByText("Good-Faith Research")).toBeVisible()
  await expect(page.getByText("Bug Bounty", { exact: true })).toBeVisible()
})

test("/blog exposes the architecture notes index", async ({ page }) => {
  await page.goto("/blog")

  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible()
  await expect(
    page.locator("a", {
      has: page.getByRole("heading", {
        name: "The Missing Layer in Agentic Development: Precise Governance",
      }),
    }),
  ).toHaveAttribute("href", "/blog/governance-native-engineering-control-plane")
  await expect(
    page.locator("a", {
      has: page.getByRole("heading", {
        name: "Intent Is Security State, Not Conversation History",
      }),
    }),
  ).toHaveAttribute("href", "/blog/intent-is-security-state")
  await expect(
    page.getByRole("link", {
      name: "Secure Platform Integration Is Not Plumbing",
      exact: true,
    }),
  ).toHaveAttribute("href", "/blog/secure-platform-integration-is-not-plumbing")
  await expect(
    page.getByText(
      "Durable technical writing for proposals, partnerships, and delivery decisions.",
    ),
  ).toBeVisible()
  await expect(
    page
      .locator(".editorial-card")
      .getByText("The Assurance Stack", { exact: true }),
  ).toHaveCount(4)
  await expect(
    page
      .locator(".editorial-card")
      .getByText("Architecture Control Boundaries", { exact: true }),
  ).toHaveCount(3)
  await expect(page.getByText("Part 1")).toHaveCount(2)
  await expect(page.getByText("Part 2")).toHaveCount(2)
  await expect(page.getByText("Part 3")).toHaveCount(2)
  await expect(page.getByText("Part 4")).toHaveCount(1)
})

test("/blog/:slug exposes article content and related notes", async ({
  page,
}) => {
  await page.goto("/blog/ai-pipelines-need-control-boundaries")

  await expect(
    page.getByRole("heading", {
      name: "AI Pipelines Need Control Boundaries",
    }),
  ).toBeVisible()
  await expect(
    page.getByText(
      "AI is not the system of record. AI is an untrusted reasoning component operating inside a governed integration path.",
    ),
  ).toBeVisible()
  await expect(
    page
      .getByRole("heading", { name: "Related notes" })
      .locator("..")
      .getByRole("link", {
        name: /Secure Platform Integration Is Not Plumbing/,
      }),
  ).toHaveAttribute("href", "/blog/secure-platform-integration-is-not-plumbing")
})

test("/blog/:slug exposes series navigation for assurance-stack posts", async ({
  page,
}) => {
  await page.goto("/blog/governance-native-engineering-control-plane")

  await expect(
    page.getByRole("heading", {
      name: "The Missing Layer in Agentic Development: Precise Governance",
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: "The Assurance Stack",
      exact: true,
    }),
  ).toHaveAttribute("href", "/blog/series/governance-native-engineering")
  await expect(page.getByText("Part 1 of 4")).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: "Next: Intent Is Security State, Not Conversation History",
    }),
  ).toHaveAttribute("href", "/blog/intent-is-security-state")
})

test("/blog/series/:slug exposes ordered series posts", async ({ page }) => {
  await page.goto("/blog/series/governance-native-engineering")

  await expect(
    page.getByRole("heading", {
      name: "The Assurance Stack",
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: "The Missing Layer in Agentic Development: Precise Governance",
    }),
  ).toHaveAttribute("href", "/blog/governance-native-engineering-control-plane")
  await expect(
    page.getByRole("link", {
      name: "Intent Is Security State, Not Conversation History",
    }),
  ).toHaveAttribute("href", "/blog/intent-is-security-state")
  await expect(
    page.getByRole("link", { name: "Replayability Is a Governance Problem" }),
  ).toHaveAttribute("href", "/blog/replayability-is-a-governance-problem")
  await expect(
    page.getByRole("link", {
      name: "Recursive Governance and Agent Workflows",
    }),
  ).toHaveAttribute("href", "/blog/recursive-governance-and-agent-workflows")
  await expect(page.getByText(/Part 1 \/ May 18, 2026/)).toBeVisible()
  await expect(page.getByText(/Part 2 \/ Aug 12, 2026/)).toBeVisible()
  await expect(page.getByText(/Part 3 \/ May 18, 2026/)).toBeVisible()
  await expect(page.getByText(/Part 4 \/ May 18, 2026/)).toBeVisible()
})

test("/blog posts expose their diagram images", async ({ page }) => {
  const blogPosts = [
    {
      path: "/blog/secure-platform-integration-is-not-plumbing",
      alt: "Diagram showing channels and source systems flowing through an API gateway, identity and validation controls into ERP core, then outward to workflows, reporting, and CI/CD.",
      src: "/img/blog/erp_integration_diagram.svg",
    },
    {
      path: "/blog/ai-pipelines-need-control-boundaries",
      alt: "Diagram showing sources flowing through preprocessing, MCP boundary, AI layer, post-processing, and finally to controlled targets.",
      src: "/img/blog/ai_pipeline_diagram.svg",
    },
    {
      path: "/blog/software-layers-are-risk-boundaries",
      alt: "Diagram showing clients flowing into interface and application layers, with the application layer connected to both domain and infrastructure.",
      src: "/img/blog/software_layers_diagram.svg",
    },
  ]

  for (const post of blogPosts) {
    await page.goto(post.path)

    const diagram = page.getByRole("img", { name: post.alt })
    await expect(diagram).toBeVisible()
    await expect(diagram).toHaveAttribute("src", post.src)
  }
})
