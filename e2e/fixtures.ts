import { test as base } from "@playwright/test"
export { expect } from "@playwright/test"
export type { Locator, Page } from "@playwright/test"

// The default Phenology source is not deployed yet. Intercept this exact
// versioned URL before navigation to avoid executing the legacy wildcard
// origin in browser tests. This stub is not a Worker qualification receipt.
const phenologyClientURL =
  "https://analytics.micrantha.com/v1/sites/micrantha-web.js"

const inertPhenologyClient = `(() => {
  "use strict";
  if (Object.prototype.hasOwnProperty.call(window, "phenology")) return;
  const noop = () => {};
  Object.defineProperty(window, "phenology", {
    value: Object.freeze({ page: noop, track: noop, setConsent: noop }),
    writable: false,
    configurable: false,
    enumerable: false,
  });
})();`

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("https://analytics.micrantha.com/**", (route) => {
      if (route.request().url() !== phenologyClientURL) {
        return route.abort("blockedbyclient")
      }
      return route.fulfill({
        status: 200,
        contentType: "application/javascript; charset=utf-8",
        body: inertPhenologyClient,
      })
    })
    await use(page)
  },
})
