import { expect, test } from "@playwright/test"

const articlePath = "/blog/ai-pipelines-need-control-boundaries"

test("MDX article renders complete content without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()

  try {
    const response = await page.goto(articlePath)

    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", {
        name: "AI Pipelines Need Control Boundaries",
      }),
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Start with the right mental model" }),
    ).toBeVisible()
    await expect(
      page.getByText(
        "AI is not the system of record. AI is an untrusted reasoning component operating inside a governed integration path.",
      ),
    ).toBeVisible()
    await expect(
      page.getByRole("img", {
        name: "Diagram showing sources flowing through preprocessing, MCP boundary, AI layer, post-processing, and finally to controlled targets.",
      }),
    ).toHaveAttribute("src", "/img/blog/ai_pipeline_diagram.svg")
    await expect(
      page.getByRole("link", {
        name: "Software Layers Are Risk Boundaries",
        exact: true,
      }),
    ).toHaveAttribute("href", "/blog/software-layers-are-risk-boundaries")
  } finally {
    await context.close()
  }
})
