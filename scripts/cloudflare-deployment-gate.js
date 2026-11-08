import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { pathToFileURL } from "node:url"

export function assertReleaseIdentity({ env, checkedOutHead }) {
  assert.equal(env.GITHUB_REPOSITORY, "hackelia-micrantha/web")
  assert.equal(env.GITHUB_REF, "refs/heads/main")
  assert.equal(env.GITHUB_EVENT_NAME, "workflow_dispatch")
  assert.equal(
    env.GITHUB_WORKFLOW_REF,
    "hackelia-micrantha/web/.github/workflows/cloudflare-production.yml@refs/heads/main",
  )
  assert.match(env.DEPLOY_SHA ?? "", /^[0-9a-f]{40}$/)
  assert.equal(
    checkedOutHead,
    env.DEPLOY_SHA,
    "checkout must equal pinned candidate",
  )
  assert.equal(env.CLOUDFLARE_PRODUCTION_DEPLOY_ENABLED, "true")
  assert.ok(env.GITHUB_TOKEN, "GitHub read token is required")
  assert.ok(env.CLOUDFLARE_API_TOKEN, "Pages deployment token is required")
  assert.match(
    env.CLOUDFLARE_ACCOUNT_ID ?? "",
    /^[0-9a-f]{32}$/,
    "Cloudflare account ID must be a 32-character hex identifier",
  )
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

export function assertCloudflarePagesProject(project) {
  assert.equal(project?.name, "micrantha-web", "wrong Cloudflare Pages project")
  assert.equal(
    project?.production_branch,
    "main",
    "wrong Pages production branch",
  )
  assert.ok(
    Array.isArray(project?.domains) &&
      project.domains.includes("micrantha.com"),
    "Pages project does not own micrantha.com",
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

  // Read-only project identity check. Pages Write tokens can read project metadata.
  // Do not rely on a project name in an arbitrary Cloudflare account as proof of ownership.
  const projectResponse = await fetcher(
    "https://api.cloudflare.com/client/v4/accounts/" +
      env.CLOUDFLARE_ACCOUNT_ID +
      "/pages/projects/micrantha-web",
    {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + env.CLOUDFLARE_API_TOKEN,
      },
    },
  )
  if (!projectResponse.ok) {
    throw new Error(
      "Cloudflare Pages project verification failed (HTTP " +
        projectResponse.status +
        ")",
    )
  }
  const project = await projectResponse.json()
  assert.equal(
    project.success,
    true,
    "Cloudflare Pages project read was unsuccessful",
  )
  assertCloudflarePagesProject(project.result)

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
