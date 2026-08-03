import { Link, useLocation } from "@remix-run/react"
import { useEffect, useRef, useState } from "react"
import { GithubIcon } from "~/components/icons"
import { ExternalLink } from "./external-link"

const MOBILE_NAVIGATION_ID = "mobile-navigation"

const navLinks = [
  { to: "/services", label: "Services" },
  { to: "/solutions", label: "Solutions" },
  { to: "/blog", label: "Blog" },
  { to: "/laboratory", label: "Laboratory" },
  { to: "/philosophy", label: "Philosophy" },
  { to: "/support", label: "Support" },
]

export const Navigation = () => {
  const location = useLocation()
  const hideMobileLogo = location.pathname === "/"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null)

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (mobileMenuTriggerRef.current?.contains(target)) return
      if (mobileMenuPanelRef.current?.contains(target)) return

      setIsMobileMenuOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [isMobileMenuOpen])

  const handleMobileMenuKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== "Escape" || !isMobileMenuOpen) return

    event.preventDefault()
    setIsMobileMenuOpen(false)
    requestAnimationFrame(() => mobileMenuTriggerRef.current?.focus())
  }

  return (
    <nav
      aria-label="Primary"
      className="relative z-50 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link
          to="/"
          aria-current={location.pathname === "/" ? "page" : undefined}
          className="flex items-center gap-3"
        >
          <img
            src="/img/logo.png"
            width="48"
            height="48"
            alt=""
            className={hideMobileLogo ? "hidden sm:block" : "block"}
          />
          <span className="text-xl font-semibold tracking-tight">
            Micrantha
          </span>
        </Link>

        <div className="hidden items-center gap-1 text-sm sm:flex">
          {navLinks.map((link) => {
            const active = isActive(link.to)

            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? "page" : undefined}
                className={`group relative px-3 py-2 transition-colors ${
                  active
                    ? "text-slate-950"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 bottom-1 h-px origin-left bg-slate-900 transition-transform duration-200 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            )
          })}
          <ExternalLink
            href="https://github.com/hackelia-micrantha"
            className="ml-1 flex items-center justify-center rounded-lg px-3 py-2 text-slate-700 transition-colors hover:text-slate-950"
            aria-label="Micrantha GitHub"
          >
            <GithubIcon />
          </ExternalLink>
        </div>

        <div className="relative sm:hidden" onKeyDown={handleMobileMenuKeyDown}>
          <button
            ref={mobileMenuTriggerRef}
            type="button"
            aria-controls={MOBILE_NAVIGATION_ID}
            aria-expanded={isMobileMenuOpen}
            aria-label={`${isMobileMenuOpen ? "Close" : "Open"} navigation menu`}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span aria-hidden="true" className="flex w-5 flex-col gap-1.5">
              <span
                className={`h-0.5 rounded bg-current transition-transform ${
                  isMobileMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 rounded bg-current transition-opacity ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 rounded bg-current transition-transform ${
                  isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>

          <div
            ref={mobileMenuPanelRef}
            id={MOBILE_NAVIGATION_ID}
            hidden={!isMobileMenuOpen}
            className="mobile-nav-panel absolute right-0 top-full z-[60] mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_50px_rgba(15,23,42,0.14)]"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.to)

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-slate-100 text-slate-950"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <ExternalLink
                href="https://github.com/hackelia-micrantha"
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                GitHub
              </ExternalLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
