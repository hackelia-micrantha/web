import type { AppLoadContext } from "@remix-run/node"

type RuntimeContractEnvironment = {
  MICRANTHA_RUNTIME_CONTRACT?: string
}

type RuntimeContractContext = AppLoadContext & {
  env?: RuntimeContractEnvironment
  cloudflare?: {
    env?: RuntimeContractEnvironment
  }
}

export function assertRuntimeContractEnabled(
  context: AppLoadContext,
  request: Request,
): void {
  const runtimeContext = context as RuntimeContractContext
  const enabled =
    runtimeContext.env?.MICRANTHA_RUNTIME_CONTRACT ??
    runtimeContext.cloudflare?.env?.MICRANTHA_RUNTIME_CONTRACT
  const hostname = new URL(request.url).hostname
  const isLoopback =
    hostname === "127.0.0.1" || hostname === "localhost" || hostname === "[::1]"

  if (!isLoopback || enabled !== "enabled") {
    throw new Response("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": "private, no-store",
      },
    })
  }
}
