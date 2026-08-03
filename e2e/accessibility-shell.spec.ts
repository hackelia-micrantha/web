import { expect, test } from "@playwright/test"

test("skip link moves focus to the main content", async ({ page }) => {
  await page.goto("/")

  await page.keyboard.press("Tab")
  const skipLink = page.getByRole("link", { name: "Skip to content" })
  await expect(skipLink).toBeFocused()

  await page.keyboard.press("Enter")
  await expect(page.locator("main#content")).toBeFocused()
})

test("desktop navigation exposes the current route", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Desktop navigation is visible only in the desktop project.",
  )

  await page.goto("/solutions")
  const navigation = page.getByRole("navigation", { name: "Primary" })

  await expect(
    navigation.getByRole("link", { name: "Solutions", exact: true }),
  ).toHaveAttribute("aria-current", "page")
  await expect(
    navigation.getByRole("link", { name: "Services", exact: true }),
  ).not.toHaveAttribute("aria-current", "page")
})

test("mobile navigation supports keyboard dismissal and route changes", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chromium",
    "Mobile disclosure behavior is exercised in the mobile project.",
  )

  await page.goto("/")
  const navigation = page.getByRole("navigation", { name: "Primary" })
  const trigger = navigation.getByRole("button", {
    name: /navigation menu/i,
  })

  await expect(trigger).toHaveAttribute("aria-expanded", "false")
  await trigger.focus()
  await page.keyboard.press("Enter")
  await expect(trigger).toHaveAttribute("aria-expanded", "true")

  const solutionsLink = navigation.getByRole("link", {
    name: "Solutions",
    exact: true,
  })
  await expect(solutionsLink).toBeVisible()
  await solutionsLink.focus()
  await page.keyboard.press("Escape")
  await expect(trigger).toHaveAttribute("aria-expanded", "false")
  await expect(trigger).toBeFocused()

  await trigger.click()
  await solutionsLink.click()
  await expect(page).toHaveURL(/\/solutions$/)
  await expect(trigger).toHaveAttribute("aria-expanded", "false")

  await trigger.click()
  await expect(
    navigation.getByRole("link", { name: "Solutions", exact: true }),
  ).toHaveAttribute("aria-current", "page")
})

test("mobile menu remains inside a 320px viewport", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chromium",
    "Narrow mobile behavior is exercised in the mobile project.",
  )

  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto("/")

  const navigation = page.getByRole("navigation", { name: "Primary" })
  await navigation.getByRole("button", { name: /navigation menu/i }).click()

  const panel = page.locator("#mobile-navigation")
  await expect(panel).toBeVisible()
  const bounds = await panel.boundingBox()

  expect(bounds).not.toBeNull()
  expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0)
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(320)

  const hasDocumentOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  )
  expect(hasDocumentOverflow).toBe(false)
})

test("reduced-motion preference suppresses decorative movement", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Reduced-motion styling only needs one browser-project assertion.",
  )

  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")

  const primaryButton = page
    .getByRole("link", { name: "Request a consultation" })
    .first()
  const maxTransitionDurationMs = await primaryButton.evaluate((element) => {
    const durations = getComputedStyle(element)
      .transitionDuration.split(",")
      .map((value) => value.trim())
      .map((value) =>
        value.endsWith("ms")
          ? Number.parseFloat(value)
          : Number.parseFloat(value) * 1000,
      )

    return Math.max(...durations)
  })

  expect(maxTransitionDurationMs).toBeLessThanOrEqual(1)
  await primaryButton.hover()
  await expect(primaryButton).toHaveCSS("transform", "none")

  const interactiveCard = page.locator(".interactive-card").first()
  await interactiveCard.hover()
  await expect(interactiveCard).toHaveCSS("transform", "none")
})
