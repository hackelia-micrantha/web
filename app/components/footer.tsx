import { Link } from "@remix-run/react"
import { useEffect, useState } from "react"
import { ExternalLink } from "./external-link"

type FortuneResponse = {
  text: string
}

export const Footer = () => {
  const [fortune, setFortune] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    let timeoutId: number | null = null

    const frameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        void fetch("/api/fortune")
          .then(async (response) => {
            if (!response.ok) return null
            return (await response.json()) as FortuneResponse
          })
          .then((data) => {
            if (isActive && data?.text) {
              setFortune(data.text)
            }
          })
          .catch(() => {})
      }, 0)
    })

    return () => {
      isActive = false
      window.cancelAnimationFrame(frameId)

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <footer className="mt-20 border-t border-gray-200 px-4 py-8 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4">
        <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-gray-600">
          <Link to="/services">Services</Link>
          <Link to="/solutions">Solutions</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/support">Support</Link>
          <Link to="/security">Security</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/philosophy">Philosophy</Link>
        </div>

        {fortune ? (
          <div className="max-w-3xl text-sm text-gray-700">
            <p>
              <span aria-hidden="true">&#10077;</span> {fortune}{" "}
              <span aria-hidden="true">&#10078;</span>
            </p>
          </div>
        ) : null}

        <div className="text-sm text-gray-600">
          <span>© All Rights Reserved</span>{" "}
          <ExternalLink href="https://micrantha.com">
            Micrantha Software
          </ExternalLink>
        </div>
      </div>
    </footer>
  )
}
