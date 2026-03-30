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

    return () => {
      isActive = false
    }
  }, [])

  return (
    <footer className="mt-20 border-t border-gray-200 px-4 py-8 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4">
        <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-gray-600">
          <Link to="/services">Services</Link>
          <Link to="/solutions">Solutions</Link>
          <Link to="/support">Support</Link>
          <Link to="/security">Security</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/philosophy">Philosophy</Link>
        </div>

        {fortune ? (
          <div className="max-w-3xl text-sm text-gray-700" aria-live="polite">
            &#10077; {fortune} &#10078;
          </div>
        ) : null}

        <div className="text-sm text-gray-600">
          &copy; All Rights Reserved{" "}
          <ExternalLink href="https://micrantha.com">
            Micrantha Software
          </ExternalLink>
        </div>
      </div>
    </footer>
  )
}
