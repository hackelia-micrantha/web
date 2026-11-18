import { expect, test, type Locator, type Page } from "@playwright/test"

async function prepareVisualPage(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(path)
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready
    }
  })
}

async function expectVisualSnapshot(locator: Locator, name: string) {
  await expect(locator).toHaveScreenshot(name, {
    animations: "disabled",
    caret: "hide",
  })
}

test.describe("visual regressions", () => {
  test.use({
    colorScheme: "light",
    deviceScaleFactor: 1,
    locale: "en-CA",
    timezoneId: "America/Vancouver",
    viewport: { width: 1440, height: 1600 },
  })

  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(
      browserName !== "chromium" ||
        testInfo.project.name !== "desktop-chromium",
      "Visual regression snapshots run once on the desktop project to keep baselines stable.",
    )
  })

  test("homepage hero remains stable", async ({ page }) => {
    await prepareVisualPage(page, "/")

    // Temporary #53 diagnostic: distinguish computed CSS from rendered fonts.
    const session = await page.context().newCDPSession(page)
    try {
      await session.send("DOM.enable")
      await session.send("CSS.enable")
      const { root } = await session.send("DOM.getDocument")
      for (const selector of [
        "main#content h1",
        "main#content p",
        "main#content a.button",
      ]) {
        const { nodeId } = await session.send("DOM.querySelector", {
          nodeId: root.nodeId,
          selector,
        })
        if (!nodeId) continue
        const { fonts } = await session.send("CSS.getPlatformFontsForNode", {
          nodeId,
        })
        const family = await page
          .locator(selector)
          .first()
          .evaluate((element) => getComputedStyle(element).fontFamily)
        console.log("Visual font diagnostic:", { selector, family, fonts })
      }
    } finally {
      await session.detach()
    }

    await expectVisualSnapshot(
      page.locator("main#content > div > section").first(),
      "home-hero.png",
    )
  })

  test("homepage services section remains stable", async ({ page }) => {
    await prepareVisualPage(page, "/")

    await expectVisualSnapshot(
      page.locator("section#services"),
      "home-services.png",
    )
  })

  test("homepage solutions section remains stable", async ({ page }) => {
    await prepareVisualPage(page, "/")

    await expectVisualSnapshot(
      page.locator("section#solutions"),
      "home-solutions.png",
    )
  })

  test("solutions page cards remain stable", async ({ page }) => {
    await prepareVisualPage(page, "/solutions")

    await expectVisualSnapshot(
      page.locator("main#content > div"),
      "solutions-page.png",
    )
  })

  test("support page cards remain stable", async ({ page }) => {
    await prepareVisualPage(page, "/support")

    await expectVisualSnapshot(
      page.locator("main#content > div"),
      "support-page.png",
    )
  })

  test("philosophy page remains stable", async ({ page }) => {
    await prepareVisualPage(page, "/philosophy")

    await expectVisualSnapshot(
      page.locator("main#content > div"),
      "philosophy-page.png",
    )
  })
})
