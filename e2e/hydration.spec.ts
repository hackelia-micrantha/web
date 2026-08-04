import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

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

test("React effects run and Remix navigation preserves the document", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chromium",
    "One hydrated browser project is sufficient for the client-runtime contract.",
  )

  const assertNoBrowserFailures = captureBrowserFailures(page)
  const fortune = "Hydration effects are active."

  await page.route("**/api/fortune", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ text: fortune }),
    }),
  )
  await page.goto("/")
  await expect(page.getByText(fortune)).toBeVisible()

  const documentIdentity = await page.evaluate(() => {
    const identity = globalThis.crypto.randomUUID()
    Object.defineProperty(globalThis, "__micranthaDocumentIdentity", {
      configurable: true,
      value: identity,
    })
    return identity
  })

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Solutions", exact: true })
    .click()

  await expect(page).toHaveURL(/\/solutions$/)
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Solutions", exact: true }),
  ).toHaveAttribute("aria-current", "page")
  expect(
    await page.evaluate(() =>
      Reflect.get(globalThis, "__micranthaDocumentIdentity"),
    ),
  ).toBe(documentIdentity)
  assertNoBrowserFailures()
})

test("Mermaid enhances only after hydration without browser errors", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chromium",
    "One hydrated browser project is sufficient for the Mermaid contract.",
  )

  const assertNoBrowserFailures = captureBrowserFailures(page)

  await page.goto("/blog/governance-native-engineering-control-plane")

  const diagram = page.locator("[data-mermaid-diagram]").first()
  await expect(diagram).toHaveAttribute("data-mermaid-status", "rendered", {
    timeout: 15_000,
  })
  await expect(diagram.locator("[data-mermaid-rendered] svg")).toBeVisible()
  await expect(diagram.locator("[data-mermaid-source]")).toHaveCount(0)
  assertNoBrowserFailures()
})

test("core article content remains usable without JavaScript", async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chromium",
    "One JavaScript-disabled browser project is sufficient for the SSR contract.",
  )

  const baseURL = String(testInfo.project.use.baseURL)
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()

  try {
    await page.goto("/blog/governance-native-engineering-control-plane")
    await expect(
      page.getByRole("heading", {
        name: "Governance-Native Engineering and the AI Control Plane",
      }),
    ).toBeVisible()

    const diagram = page.locator("[data-mermaid-diagram]").first()
    await expect(diagram).toHaveAttribute("data-mermaid-status", "source")
    await expect(diagram.locator("[data-mermaid-source]")).toContainText(
      "Human intent",
    )

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Solutions", exact: true })
      .click()
    await expect(page).toHaveURL(/\/solutions$/)
    await expect(
      page.getByRole("heading", { name: "Solutions", level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByText(
        "Deployable systems, distributions, tools, and platforms.",
      ),
    ).toBeVisible()
  } finally {
    await context.close()
  }
})
