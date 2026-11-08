import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  assertMainAndCi,
  assertCloudflarePagesProject,
  assertReleaseIdentity,
  validateCloudflareReleaseGate,
} from "../../scripts/cloudflare-deployment-gate.js"

const sha = "a".repeat(40)
const env = {
  GITHUB_REPOSITORY: "hackelia-micrantha/web",
  GITHUB_REF: "refs/heads/main",
  GITHUB_EVENT_NAME: "workflow_dispatch",
  GITHUB_WORKFLOW_REF:
    "hackelia-micrantha/web/.github/workflows/cloudflare-production.yml@refs/heads/main",
  DEPLOY_SHA: sha,
  GITHUB_TOKEN: "test-gh-token",
  CLOUDFLARE_PRODUCTION_DEPLOY_ENABLED: "true",
  CLOUDFLARE_API_TOKEN: "test-pages-token",
  CLOUDFLARE_ACCOUNT_ID: "c".repeat(32),
  CLOUDFLARE_PAGES_PROJECT: "micrantha-web",
  CLOUDFLARE_PAGES_BRANCH: "main",
}
const project = {
  name: "micrantha-web",
  production_branch: "main",
  domains: ["micrantha.com", "www.micrantha.com"],
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
    { GITHUB_REF: "refs/heads/untrusted-branch" },
    { GITHUB_EVENT_NAME: "pull_request" },
    {
      GITHUB_WORKFLOW_REF:
        "hackelia-micrantha/web/.github/workflows/cloudflare-production.yml@refs/heads/untrusted-branch",
    },
    { DEPLOY_SHA: "main" },
    { CLOUDFLARE_PRODUCTION_DEPLOY_ENABLED: "false" },
    { CLOUDFLARE_API_TOKEN: "" },
    { CLOUDFLARE_ACCOUNT_ID: "" },
    { CLOUDFLARE_ACCOUNT_ID: "another-account" },
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
      assert.equal(
        options.headers.Authorization,
        url.includes("api.cloudflare.com")
          ? "Bearer test-pages-token"
          : "Bearer test-gh-token",
      )
      return {
        ok: true,
        json: async () =>
          url.includes("/git/ref/heads/main")
            ? { object: { sha } }
            : url.includes("api.cloudflare.com")
              ? { success: true, result: project }
              : { workflow_runs: [{ ...goodRun }] },
      }
    },
  })
  assert.deepEqual(result, { sha, qualified: true })
  assert.equal(urls.length, 3)
  assert.ok(urls[1].includes("head_sha=" + sha))
  assert.ok(urls[2].endsWith("/pages/projects/micrantha-web"))
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

test("workflow remains manual, main-only, and checks release identity before effect", () => {
  const source = readFileSync(
    new URL(
      "../../.github/workflows/cloudflare-production.yml",
      import.meta.url,
    ),
    "utf8",
  )
  assert.match(source, /^on:\n {2}workflow_dispatch:/m)
  assert.doesNotMatch(source, /^ {2}push:/m)
  assert.match(source, /environment: production/)
  assert.match(source, /ref: main/)
  assert.match(source, /CLOUDFLARE_PRODUCTION_DEPLOY_ENABLED/)
  const preflight = source.indexOf("- name: Refuse non-main dispatch")
  const checkout = source.indexOf("- name: Check out current main")
  const firstGate = source.indexOf("- name: Verify source, CI evidence")
  const validation = source.indexOf("- name: Validate candidate")
  const integrity = source.indexOf("- name: Refuse tracked release-contract")
  const effectGate = source.indexOf("- name: Recheck exact main")
  const publish = source.indexOf("- name: Publish with pinned Wrangler")
  assert.ok(preflight > 0)
  assert.ok(preflight < checkout)
  assert.ok(checkout < firstGate)
  assert.ok(firstGate < validation)
  assert.ok(validation < integrity)
  assert.ok(integrity < effectGate)
  assert.ok(effectGate < publish)
})

test("Pages project read must match domain, project and production branch", () => {
  assert.doesNotThrow(() => assertCloudflarePagesProject(project))
  for (const candidate of [
    { ...project, name: "amaryllis" },
    { ...project, production_branch: "production" },
    { ...project, domains: ["other.example"] },
    { ...project, domains: null },
    null,
  ]) {
    assert.throws(() => assertCloudflarePagesProject(candidate))
  }
})

test("Pages lookup must succeed before release admission", async () => {
  for (const scenario of ["denied", "api_error", "wrong_domain"]) {
    await assert.rejects(
      validateCloudflareReleaseGate({
        env,
        checkedOutHead: sha,
        fetcher: async (url) => {
          if (url.includes("api.cloudflare.com")) {
            if (scenario === "denied") return { ok: false, status: 403 }
            return {
              ok: true,
              json: async () =>
                scenario === "api_error"
                  ? { success: false, result: project }
                  : { success: true, result: { ...project, domains: [] } },
            }
          }
          return {
            ok: true,
            json: async () =>
              url.includes("/git/ref/heads/main")
                ? { object: { sha } }
                : { workflow_runs: [goodRun] },
          }
        },
      }),
    )
  }
})
