// Generated only from the reviewed, build-time site manifest. No network config fetch.
export function lenticelClient(config) {
  "use strict"

  if (Object.prototype.hasOwnProperty.call(window, "lenticel")) return

  let consent = "denied"
  let initialized = false

  function startGa4() {
    if (initialized) return true
    if (config.provider !== "ga4") return false

    const id = config.measurementId
    if (typeof id !== "string" || !/^G-[A-Z0-9]+$/.test(id)) return false

    // Never silently share a GA4 instance with another site integration.
    if (window.gtag || window.dataLayer) return false
    if (
      document.querySelector(
        'script[src^="https://www.googletagmanager.com/gtag/js"]',
      )
    ) {
      return false
    }

    try {
      const script = document.createElement("script")
      script.async = true
      script.src =
        "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id)

      window.dataLayer = []
      window.gtag = function () {
        window.dataLayer.push(arguments)
      }
      window.gtag("js", new Date())
      window.gtag("config", id, { send_page_view: false })
      document.head.appendChild(script)
      initialized = true
      return true
    } catch {
      return false
    }
  }

  const api = Object.freeze({
    setConsent(value) {
      if (value !== "granted" && value !== "denied") return
      consent = value
      if (value === "granted") startGa4()
    },

    page(path = window.location.pathname) {
      if (consent !== "granted") return
      if (typeof path !== "string" || !config.paths.includes(path)) return
      if (!startGa4()) return

      // Only explicit, reviewed paths. Never transmit URL queries or fragments.
      window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.origin + path,
        page_title: config.titles[path] ?? "",
      })
    },

    track(name, props = {}) {
      if (consent !== "granted" || typeof name !== "string") return
      if (!Object.prototype.hasOwnProperty.call(config.events, name)) return
      if (props === null || Array.isArray(props) || typeof props !== "object") {
        return
      }

      const policy = config.events[name]
      const safe = {}
      for (const [key, value] of Object.entries(props)) {
        if (!Object.prototype.hasOwnProperty.call(policy, key)) return
        if (!policy[key].includes(value)) return
        safe[key] = value
      }

      if (!startGa4()) return
      window.gtag("event", name, safe)
    },
  })

  Object.defineProperty(window, "lenticel", {
    value: api,
    writable: false,
    configurable: false,
    enumerable: false,
  })
}

export function createClientScript(config) {
  // The client is self-contained: no imports, dynamic eval, or runtime config.
  return `;(${lenticelClient.toString()})(${JSON.stringify(config)});\n`
}
