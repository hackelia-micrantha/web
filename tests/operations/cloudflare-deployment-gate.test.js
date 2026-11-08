import assert from "node:assert/strict"
import test from "node:test"
import {
  assertMainAndCi,
  assertReleaseIdentity,
  validateCloudflareReleaseGate,
} from "../../scripts/cloudflare-deployment-gate.js"

const sha = "a".repeat(40)
const env = {
  GITHUB_REPOSITORY: "hackelia-micrantha/web",
  DEPLOY_SHA: sha,
  GITHUB_TOKEN: "test-gh-token",
  CLOUDFLARE_PRODUCTION_DEPLOY_ENABLED: "true",
  CLOUDFLARE_API_TOKEN: "test-pages-token",
  CLOUDFLARE_ACCOUNT_ID: "test-account",
  CLOUDFLARE_PAGES_PROJECT: "micrantha-web",
  CLOUDFLARE_PAGES_BRANCH: "main",
}
const goodRun = {
  head_sha: sha,
  head_branch: "main",
  event: "push",
  status: "completed",
  conclusion: "success",
  path: ".github/workflows/ci.yml",
}

test("identity binds repository, checkout, project, branch and explicit grant", () => {
  assert.doesNotThrow(() => assertReleaseIdentity({ env, checkedOutHead: sha }))
  const mutations = [
    { GITHUB_REPOSITORY: "another/repo" },
    { DEPLOY_SHA: "main" },
    { CLOUDFLARE_PRODUCTION_DEPLOY_ENABLED: "false" },
    { CLOUDFLARE_API_TOKEN: "" },
    { CLOUDFLARE_ACCOUNT_ID: "" },
    { GITHUB_TOKEN: "" },
    { CLOUDFLARE_PAGES_PROJECT: "amaryllis-9ne" },
    { CLOUDFLARE_PAGES_BRANCH: "preview" },
  ]
  for (const mutation of mutations) {
    assert.throws(() =>
      assertReleaseIdentity({
        env: { ...env, ...mutation },
        checkedOutHead: sha,
      }),
    )
  }
  assert.throws(() =>
    assertReleaseIdentity({ env, checkedOutHead: "b".repeat(40) }),
  )
})

test("release requires exact main and successful push CI", () => {
  assert.doesNotThrow(() =>
    assertMainAndCi({ candidate: sha, main: sha, runs: [goodRun] }),
  )
  assert.throws(() =>
    assertMainAndCi({ candidate: sha, main: "b".repeat(40), runs: [goodRun] }),
  )
  for (const mutation of [
    { head_sha: "b".repeat(40) },
    { head_branch: "feature" },
    { event: "pull_request" },
    { status: "in_progress" },
    { conclusion: "failure" },
    { path: ".github/workflows/other.yml" },
  ]) {
    assert.throws(() =>
      assertMainAndCi({
        candidate: sha,
        main: sha,
        runs: [{ ...goodRun, ...mutation }],
      }),
    )
  }
  assert.throws(() => assertMainAndCi({ candidate: sha, main: sha, runs: [] }))
})

test("API verification refuses non-success HTTP responses", async () => {
  await assert.rejects(
    validateCloudflareReleaseGate({
      env,
      checkedOutHead: sha,
      fetcher: async () => ({ ok: false, status: 403 }),
    }),
    /HTTP 403/,
  )
})

test("API verification accepts one exact-head successful CI run", async () => {
  const urls = []
  const result = await validateCloudflareReleaseGate({
    env,
    checkedOutHead: sha,
    fetcher: async (url, options) => {
      urls.push(url)
      assert.equal(options.headers.Authorization, "Bearer test-gh-token")
      return {
        ok: true,
        json: async () =>
          url.includes("/git/ref/heads/main")
            ? { object: { sha } }
            : { workflow_runs: [{ ...goodRun }] },
      }
    },
  })
  assert.deepEqual(result, { sha, qualified: true })
  assert.equal(urls.length, 2)
  assert.ok(urls[1].includes("head_sha=" + sha))
})

test("API verification rejects main drift before publication", async () => {
  await assert.rejects(
    validateCloudflareReleaseGate({
      env,
      checkedOutHead: sha,
      fetcher: async (url) => ({
        ok: true,
        json: async () =>
          url.includes("/git/ref/heads/main")
            ? { object: { sha: "b".repeat(40) } }
            : { workflow_runs: [goodRun] },
      }),
    }),
    /main changed/,
  )
})
