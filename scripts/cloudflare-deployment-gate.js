import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { pathToFileURL } from "node:url"

export function assertReleaseIdentity({ env, checkedOutHead }) {
  assert.equal(env.GITHUB_REPOSITORY, "hackelia-micrantha/web")
  assert.match(env.DEPLOY_SHA ?? "", /^[0-9a-f]{40}$/)
  assert.equal(
    checkedOutHead,
    env.DEPLOY_SHA,
    "checkout must equal pinned candidate",
  )
  assert.equal(env.CLOUDFLARE_PRODUCTION_DEPLOY_ENABLED, "true")
  assert.ok(env.GITHUB_TOKEN, "GitHub read token is required")
  assert.ok(env.CLOUDFLARE_API_TOKEN, "Pages deployment token is required")
  assert.ok(env.CLOUDFLARE_ACCOUNT_ID, "Cloudflare account is required")
  assert.equal(env.CLOUDFLARE_PAGES_PROJECT, "micrantha-web")
  assert.equal(env.CLOUDFLARE_PAGES_BRANCH, "main")
}

export function assertMainAndCi({ candidate, main, runs }) {
  assert.equal(main, candidate, "main changed; candidate is stale")
  assert.ok(
    runs.some(
      (run) =>
        run.head_sha === candidate &&
        run.head_branch === "main" &&
        run.event === "push" &&
        run.status === "completed" &&
        run.conclusion === "success" &&
        run.path === ".github/workflows/ci.yml",
    ),
    "no successful exact-main push CI run for candidate",
  )
}

export async function validateCloudflareReleaseGate({
  env,
  checkedOutHead,
  fetcher,
}) {
  assertReleaseIdentity({ env, checkedOutHead })

  const base = "https://api.github.com/repos/" + env.GITHUB_REPOSITORY
  const request = async (url) => {
    const response = await fetcher(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + env.GITHUB_TOKEN,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    if (!response.ok) {
      throw new Error(
        "GitHub release verification failed (HTTP " + response.status + ")",
      )
    }
    return response.json()
  }

  const ref = await request(base + "/git/ref/heads/main")
  // Server-side query scopes to main push CI. The exact SHA is checked below.
  const ci = await request(
    base +
      "/actions/workflows/ci.yml/runs?branch=main&event=push&head_sha=" +
      env.DEPLOY_SHA +
      "&per_page=30",
  )

  assertMainAndCi({
    candidate: env.DEPLOY_SHA,
    main: ref.object?.sha,
    runs: ci.workflow_runs ?? [],
  })

  return { sha: env.DEPLOY_SHA, qualified: true }
}

async function main() {
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim()
  const result = await validateCloudflareReleaseGate({
    env: process.env,
    checkedOutHead: head,
    fetcher: fetch,
  })
  console.log("PRODUCTION_RELEASE_GATE=PASS candidate=" + result.sha)
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    // Do not write the environment, token, API body, or credential values to logs.
    console.error("PRODUCTION_RELEASE_GATE=FAIL " + error.message)
    process.exitCode = 1
  })
}
