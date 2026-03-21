import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const pages = [
  { path: "/", heading: "Software that grows with you." },
  { path: "/solutions", heading: "Solutions" },
  { path: "/support", heading: "Support" },
]

for (const { path, heading } of pages) {
  test(`accessibility scan passes for ${path}`, async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chromium",
      "Accessibility scans run once on the desktop project to keep CI output focused.",
    )

    await page.goto(path)
    await expect(page.getByRole("heading", { name: heading })).toBeVisible()

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
}
