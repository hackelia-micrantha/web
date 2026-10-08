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
  test(`accessibility and browser health pass for ${path}`, async ({
    page,
  }) => {
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
    "/blog/intent-is-security-state",
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
  const tableRegion = page.getByRole("region", {
    name: "AI pipeline failure modes table",
  })

  await expect(controlTable).toBeVisible()
  await expect(tableRegion).toHaveAttribute("tabindex", "0")
  expect(
    await tableRegion.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true)
  await tableRegion.focus()
  await expect(tableRegion).toBeFocused()

  const controlDocumentStillContained = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )

  expect(controlDocumentStillContained).toBe(true)

  await page.goto("/blog/intent-is-security-state")

  const policyTable = page.getByRole("table").first()
  const policyTableRegion = page.getByRole("region", {
    name: "Scrollable article table",
  })
  const policyTableFrame = policyTableRegion.locator("..")

  await expect(policyTable).toBeVisible()
  await expect(policyTable).toHaveCSS("display", "table")
  await expect(policyTable.locator("td").first()).toHaveCSS(
    "white-space",
    "normal",
  )
  await expect(policyTableRegion).toHaveAttribute("tabindex", "0")
  await expect(policyTableRegion).toHaveCSS("overflow-x", "auto")
  await expect(
    policyTableFrame.getByText(
      "Scroll horizontally if needed to view all columns.",
    ),
  ).toBeVisible()

  const policyDocumentStillContained = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )

  expect(policyDocumentStillContained).toBe(true)
})
