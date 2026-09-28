import { expect, test, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

type AccessibilityRoute = {
  path: string
  heading: string
  status?: number
  checkBrowserHealth?: boolean
}

const routes: AccessibilityRoute[] = [
  { path: "/", heading: "Software that grows with you." },
  { path: "/solutions", heading: "Solutions" },
  { path: "/laboratory", heading: "Laboratory" },
  { path: "/blog", heading: "Blog" },
  {
    path: "/blog/ai-pipelines-need-control-boundaries",
    heading: "AI Pipelines Need Control Boundaries",
  },
  { path: "/security", heading: "Security" },
  { path: "/support", heading: "Support" },
  {
    path: "/this-route-does-not-exist",
    heading: "Not Found",
    status: 404,
    checkBrowserHealth: false,
  },
]

type BrowserFailure = {
  kind: "console" | "pageerror"
  message: string
}

function captureBrowserFailures(page: Page) {
  const failures: BrowserFailure[] = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push({ kind: "console", message: message.text() })
    }
  })
  page.on("pageerror", (error) => {
    failures.push({ kind: "pageerror", message: error.message })
  })

  return () => expect(failures).toEqual([])
}

for (const {
  path,
  heading,
  status = 200,
  checkBrowserHealth = true,
} of routes) {
  test(`accessibility and browser health pass for ${path}`, async ({ page }) => {
    const assertNoBrowserFailures = checkBrowserHealth
      ? captureBrowserFailures(page)
      : null
    const response = await page.goto(path)

    expect(response?.status()).toBe(status)
    await expect(
      page.getByRole("heading", { name: heading, level: 1 }),
    ).toBeVisible()

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
    assertNoBrowserFailures?.()
  })
}

test("narrow long-form routes keep wide content locally contained", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chromium",
    "The 320px reflow contract runs once in the mobile project.",
  )

  await page.setViewportSize({ width: 320, height: 800 })

  for (const path of [
    "/blog/ai-pipelines-need-control-boundaries",
    "/blog/governance-native-engineering-control-plane",
    "/security",
  ]) {
    await page.goto(path)

    if (path === "/blog/governance-native-engineering-control-plane") {
      await expect(
        page.locator("[data-mermaid-diagram]").first(),
      ).toHaveAttribute("data-mermaid-status", "rendered", {
        timeout: 15_000,
      })
    }

    const hasDocumentOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    )

    expect(hasDocumentOverflow, `${path} must not overflow the document`).toBe(
      false,
    )
  }

  await page.goto("/blog/ai-pipelines-need-control-boundaries")

  const controlTable = page.getByRole("table", {
    name: "AI pipeline failure modes",
  })
  const tableRegion = controlTable.locator("..")

  await expect(controlTable).toBeVisible()
  expect(
    await tableRegion.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true)

  const documentStillContained = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )

  expect(documentStillContained).toBe(true)
})
