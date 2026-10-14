import { expect, test, type Page } from "@playwright/test"

const navTargets = {
  Blog: "/blog",
  Solutions: "/solutions",
  Support: "/support",
}

async function clickNavigationLink(page: Page, name: keyof typeof navTargets) {
  const navigation = page.getByRole("navigation", { name: "Primary" })
  const target = navTargets[name]
  const visibleLink = navigation.locator(`a[href="${target}"]:visible`)

  if ((await visibleLink.count()) === 0) {
    await navigation.locator("details[data-mobile-navigation] summary").click()
  }

  await visibleLink.click()
}

test("homepage exposes primary marketing content", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", {
      name: "Software that grows with you.",
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Request a consultation" }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Request a consultation" }).first(),
  ).toHaveAttribute("href", "/services")
  await expect(
    page.getByRole("heading", {
      name: "Engineering support for systems that need to survive production.",
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "See the work" }),
  ).toHaveAttribute("href", "#solutions")
  await expect(
    page.getByRole("link", { name: "Read architecture notes" }),
  ).toHaveAttribute("href", "/blog")
  await expect(
    page.getByText(
      "Broad engineering support across AI development, AI governance, mobile platforms, secure authentication, and deployment systems for teams turning fragile software into production systems.",
    ),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", {
      name: "Help build, validate, and grow the Micrantha ecosystem.",
    }),
  ).toBeVisible()
  await expect(
    page.getByText(
      /strategic partners, a co-founder or long-term operating partner/,
    ),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Discuss a partnership" }),
  ).toHaveAttribute(
    "href",
    "mailto:services@micrantha.com?subject=Micrantha%20collaboration",
  )
  await expect(
    page.getByRole("link", { name: "Anthesis agentic-system trials" }),
  ).toHaveAttribute("href", "https://anthesis.micrantha.com/#collaborate")

  const solutionsHeading = page.getByRole("heading", {
    name: "Deployable systems for governed delivery.",
  })
  const laboratoryHeading = page.getByRole("heading", {
    name: "Testbeds that validate the architecture.",
  })
  const architectureHeading = page.getByRole("heading", {
    name: "Technical writing for teams dealing with real delivery constraints.",
  })

  const scanOrder = await page.evaluate(() => {
    const headings = [
      "Deployable systems for governed delivery.",
      "Testbeds that validate the architecture.",
      "Technical writing for teams dealing with real delivery constraints.",
    ].map((text) =>
      [...document.querySelectorAll("h2")].find(
        (heading) => heading.textContent?.trim() === text,
      ),
    )

    if (headings.some((heading) => !heading)) return false

    return (
      Boolean(
        headings[0]?.compareDocumentPosition(headings[1]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ) &&
      Boolean(
        headings[1]?.compareDocumentPosition(headings[2]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      )
    )
  })

  expect(scanOrder).toBe(true)
})

test("primary navigation reaches key sections and routes", async ({ page }) => {
  await page.goto("/")

  await clickNavigationLink(page, "Solutions")
  await expect(page).toHaveURL(/\/solutions$/)
  await expect(page.getByRole("heading", { name: "Solutions" })).toBeVisible()
  await expect(
    page.getByText("Deployable systems, distributions, tools, and platforms."),
  ).toBeVisible()

  await clickNavigationLink(page, "Blog")
  await expect(page).toHaveURL(/\/blog$/)
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible()
  await expect(
    page.getByText(
      "Architecture notes on secure platform integration, delivery governance, AI-assisted systems, and long-lived software design.",
    ),
  ).toBeVisible()

  await clickNavigationLink(page, "Support")
  await expect(page).toHaveURL(/\/support$/)
  await expect(page.getByRole("heading", { name: "Support" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "support@micrantha.com" }),
  ).toHaveAttribute("href", "mailto:support@micrantha.com")
  await expect(
    page.getByText(
      "Choose the support channel that fits the urgency and shape of the issue.",
    ),
  ).toBeVisible()
})
