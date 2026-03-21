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
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chromium",
      "Visual regression snapshots run once on the desktop project to keep baselines stable.",
    )

    await page.setViewportSize({ width: 1440, height: 1600 })
  })

  test("homepage hero remains stable", async ({ page }) => {
    await prepareVisualPage(page, "/")

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
})
