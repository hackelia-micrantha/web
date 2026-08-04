import { expect, test } from "@playwright/test"

const articlePath = "/blog/recursive-governance-and-agent-workflows"
const modifiedTime = "2026-08-03T00:00:00Z"

test("publishes updatedAt through article metadata and structured data", async ({
  page,
}) => {
  const response = await page.goto(articlePath)

  expect(response?.status()).toBe(200)
  await expect(
    page.locator('meta[property="article:modified_time"]'),
  ).toHaveAttribute("content", modifiedTime)

  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .textContent()

  expect(structuredData).toContain(`"dateModified":"${modifiedTime}"`)
})
