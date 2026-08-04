import { readFileSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { expect, test } from "@playwright/test"
import type { Response } from "@playwright/test"

type BrowserRuntimeBudgets = {
  documents: Array<{
    pathname: string
    uncompressedBytes: number
  }>
  externalRequests: {
    count: number
    transferBytes: number
  }
  timings: {
    enforcement: string
  }
}

const performanceBudgets = JSON.parse(
  readFileSync(
    new URL("../config/performance-budgets.json", import.meta.url),
    "utf8",
  ),
) as { browserRuntime: BrowserRuntimeBudgets }
const runtimeBudgets = performanceBudgets.browserRuntime
const evidenceDirectory = path.join(process.cwd(), ".performance/browser")

function evidenceFilename(projectName: string, pathname: string) {
  const routeName =
    pathname === "/"
      ? "root"
      : pathname.replace(/^\//u, "").replace(/[^a-zA-Z0-9_-]+/gu, "-")

  return `${projectName}-${routeName}.json`
}

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
    const documentBytes = documentBody?.byteLength ?? 0
    expect(documentBytes).toBeLessThanOrEqual(
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
    const evidence = {
      schemaVersion: 1,
      pathname: documentBudget.pathname,
      project: testInfo.project.name,
      enforcement: runtimeBudgets.timings.enforcement,
      documentBytes,
      externalRequestCount: externalRequests.size,
      externalTransferBytes,
      timing,
    }
    const serializedEvidence = `${JSON.stringify(evidence, null, 2)}\n`

    await mkdir(evidenceDirectory, { recursive: true })
    await writeFile(
      path.join(
        evidenceDirectory,
        evidenceFilename(testInfo.project.name, documentBudget.pathname),
      ),
      serializedEvidence,
    )
    await testInfo.attach("performance-advisory.json", {
      body: Buffer.from(serializedEvidence),
      contentType: "application/json",
    })
  })
}
