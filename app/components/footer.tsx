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
    <footer className="mt-16 flex flex-col items-center justify-center">
      <div>
        <Link to="/services">Services</Link> |{" "}
        <Link to="/solutions">Solutions</Link> |{" "}
        <Link to="/support">Support</Link> | <Link to="/privacy">Privacy</Link>{" "}
        | <Link to="/philosophy">Philosophy</Link>
      </div>

      {fortune ? (
        <div className="mx-10 mt-4" aria-live="polite">
          &#10077; {fortune} &#10078;
        </div>
      ) : null}

      <div className="mt-2">
        &copy; All Rights Reserved{" "}
        <ExternalLink href="https://micrantha.com">
          Micrantha Software Solutions
        </ExternalLink>
      </div>
    </footer>
  )
}
