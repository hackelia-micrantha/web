import { RemixBrowser } from "@remix-run/react"
import { startTransition } from "react"
import { hydrateRoot } from "react-dom/client"

startTransition(() => {
  hydrateRoot(document, <RemixBrowser />, {
    onRecoverableError(error, errorInfo) {
      console.error(
        "Recoverable React hydration error",
        error,
        errorInfo.componentStack,
      )
    },
  })
})

void import("./client/mermaid.client")
  .then(({ installMermaidRenderer }) => installMermaidRenderer())
  .catch((error) => {
    console.error("Failed to initialize Mermaid rendering", error)
  })
