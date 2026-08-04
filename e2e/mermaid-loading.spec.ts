import { expect, test } from "@playwright/test"

test("loads Mermaid only after a diagram route mounts", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chromium",
    "One browser project is sufficient for the demand-loading contract.",
  )

  const browserErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  page.on("pageerror", (error) => browserErrors.push(error.message))

  await page.goto("/")
  await page.waitForTimeout(500)
  expect(
    await page.evaluate(() => typeof window.__micranthaRenderMermaid),
  ).toBe("undefined")

  await page.goto("/blog/governance-native-engineering-control-plane")

  const diagram = page.locator("[data-mermaid-diagram]").first()
  await expect(diagram).toHaveAttribute("data-mermaid-status", "rendered", {
    timeout: 15_000,
  })
  expect(
    await page.evaluate(() => typeof window.__micranthaRenderMermaid),
  ).toBe("function")
  expect(browserErrors).toEqual([])
})
