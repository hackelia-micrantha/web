import { expect, test } from "@playwright/test"
import type { Response } from "@playwright/test"

import performanceBudgets from "../config/performance-budgets.json"

const runtimeBudgets = performanceBudgets.browserRuntime

for (const documentBudget of runtimeBudgets.documents) {
  test(`keeps ${documentBudget.pathname} within browser runtime budgets`, async ({
    page,
  }, testInfo) => {
    if (
      testInfo.project.name === "mobile-chromium" &&
      documentBudget.pathname !== "/"
    ) {
      test.skip(
        true,
        "The homepage supplies the pinned mobile performance sample.",
      )
    }

    const baseUrl = new URL(String(testInfo.project.use.baseURL))
    const externalRequests = new Set<string>()
    const externalResponses: Response[] = []

    page.on("request", (request) => {
      const requestUrl = new URL(request.url())

      if (requestUrl.origin !== baseUrl.origin) {
        externalRequests.add(request.url())
      }
    })
    page.on("response", (response) => {
      const responseUrl = new URL(response.url())

      if (responseUrl.origin !== baseUrl.origin) {
        externalResponses.push(response)
      }
    })

    const documentResponse = await page.goto(documentBudget.pathname)
    await page.waitForLoadState("networkidle")

    expect(documentResponse?.status()).toBe(200)
    const documentBody = await documentResponse?.body()
    expect(documentBody, "expected a document response body").toBeTruthy()
    expect(documentBody?.byteLength ?? 0).toBeLessThanOrEqual(
      documentBudget.uncompressedBytes,
    )

    const externalTransferBytes = (
      await Promise.all(
        externalResponses.map(async (response) => {
          try {
            return (await response.body()).byteLength
          } catch {
            return 0
          }
        }),
      )
    ).reduce((total, bytes) => total + bytes, 0)

    expect(externalRequests.size).toBeLessThanOrEqual(
      runtimeBudgets.externalRequests.count,
    )
    expect(externalTransferBytes).toBeLessThanOrEqual(
      runtimeBudgets.externalRequests.transferBytes,
    )

    const timing = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming

      return {
        responseStartMilliseconds: navigation.responseStart,
        domContentLoadedMilliseconds: navigation.domContentLoadedEventEnd,
        loadMilliseconds: navigation.loadEventEnd,
      }
    })

    await testInfo.attach("performance-advisory.json", {
      body: Buffer.from(
        `${JSON.stringify(
          {
            pathname: documentBudget.pathname,
            project: testInfo.project.name,
            enforcement: runtimeBudgets.timings.enforcement,
            timing,
          },
          null,
          2,
        )}\n`,
      ),
      contentType: "application/json",
    })
  })
}
