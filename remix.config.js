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
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
}
