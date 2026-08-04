import fs from "node:fs"
import { defineConfig, devices } from "@playwright/test"

const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  : fs.existsSync("/usr/bin/chromium")
    ? "/usr/bin/chromium"
    : undefined
const port = Number(process.env.CLOUDFLARE_PLAYWRIGHT_PORT ?? 8788)
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: "./e2e",
  testMatch: "hydration.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  outputDir: "test-results-cloudflare",
  reporter: process.env.CI
    ? [
        ["list"],
        [
          "html",
          {
            outputFolder: "playwright-report-cloudflare",
            open: "never",
          },
        ],
      ]
    : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions: chromiumExecutablePath
      ? { executablePath: chromiumExecutablePath }
      : undefined,
  },
  webServer: {
    command: [
      "yarn build",
      "yarn cloudflare:functions:build",
      "yarn cloudflare:runtime:stage",
      `yarn wrangler --cwd .cloudflare/runtime dev --config wrangler.toml --no-bundle --ip 127.0.0.1 --port ${port} --local-protocol http --show-interactive-dev-session=false`,
    ].join(" && "),
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
    env: {
      CI: "true",
      NO_COLOR: "1",
      WRANGLER_SEND_METRICS: "false",
    },
  },
  projects: [
    {
      name: "cloudflare-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
