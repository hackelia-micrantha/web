const isCloudflarePagesBuild =
  process.env.REMIX_DEPLOY_TARGET === "cloudflare-pages"

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  ignoredRouteFiles: [".*"],
  future: {
    v3_fetcherPersist: true,
    v3_lazyRouteDiscovery: false,
    v3_relativeSplatPath: true,
    v3_singleFetch: false,
    v3_throwAbortReason: true,
  },
  ...(isCloudflarePagesBuild
    ? {
        serverBuildPath: "functions/[[path]].js",
        serverConditions: ["worker"],
        serverDependenciesToBundle: "all",
        serverMainFields: ["browser", "module", "main"],
        serverMinify: true,
        serverPlatform: "neutral",
      }
    : {}),
}
