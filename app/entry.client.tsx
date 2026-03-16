import { RemixBrowser } from "@remix-run/react"
import { hydrateRoot } from "react-dom/client"

// Temporary production hardening: disable hydration until SSR/client mismatch is fully root-caused.
const ENABLE_HYDRATION = false

if (ENABLE_HYDRATION) {
  hydrateRoot(document, <RemixBrowser />)
}
