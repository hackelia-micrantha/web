import { Link, useLocation } from "@remix-run/react"
import { GithubIcon } from "~/components/icons"
import { ExternalLink } from "./external-link"

const navLinks = [
  { to: "/services", label: "Services" },
  { to: "/solutions", label: "Solutions" },
  { to: "/laboratory", label: "Laboratory" },
  { to: "/philosophy", label: "Philosophy" },
  { to: "/support", label: "Support" },
]

export const Navigation = () => {
  const location = useLocation()
  const hideMobileLogo = location.pathname === "/"

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  return (
    <nav className="relative z-50 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="Micrantha home"
            className={hideMobileLogo ? "hidden sm:block" : "block"}
          >
            <img
              src="/img/logo.png"
              width="48"
              height="48"
              alt="Micrantha logo"
            />
          </Link>
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Micrantha
          </Link>
        </div>

        <div className="hidden items-center gap-1 text-sm sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group relative px-3 py-2 transition-colors ${
                isActive(link.to)
                  ? "text-slate-950"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              {link.label}
              <span
                className={`absolute inset-x-3 bottom-1 h-px origin-left bg-slate-900 transition-transform duration-200 ${
                  isActive(link.to)
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
          <ExternalLink
            href="https://github.com/hackelia-micrantha"
            className="ml-1 flex items-center justify-center rounded-lg px-3 py-2 text-slate-700 transition-colors hover:text-slate-950"
            aria-label="Micrantha GitHub"
          >
            <GithubIcon />
          </ExternalLink>
        </div>

        <details className="group relative sm:hidden">
          <summary className="flex h-11 w-11 list-none items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Toggle menu</span>
            <span className="flex w-5 flex-col gap-1.5">
              <span className="h-0.5 rounded bg-current transition-transform group-open:translate-y-2 group-open:rotate-45" />
              <span className="h-0.5 rounded bg-current transition-opacity group-open:opacity-0" />
              <span className="h-0.5 rounded bg-current transition-transform group-open:-translate-y-2 group-open:-rotate-45" />
            </span>
          </summary>

          <div className="mobile-nav-panel absolute right-0 top-full z-[60] mt-3 w-72 origin-top rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_50px_rgba(15,23,42,0.14)]">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <ExternalLink
                href="https://github.com/hackelia-micrantha"
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                GitHub
              </ExternalLink>
            </div>
          </div>
        </details>
      </div>
    </nav>
  )
}
