import { Link, useLocation } from "@remix-run/react"
import { GithubIcon } from "~/components/icons"
import { ExternalLink } from "./external-link"

const MOBILE_NAVIGATION_ID = "mobile-navigation"

type NavigationLink = { to: string; label: string }

type NavigationSection =
  | NavigationLink
  | { label: string; id: string; links: NavigationLink[] }

const navSections: NavigationSection[] = [
  { to: "/services", label: "Services" },
  {
    label: "Projects",
    id: "projects-navigation",
    links: [
      { to: "/solutions", label: "Solutions" },
      { to: "/laboratory", label: "Laboratory" },
      { to: "/compost", label: "Compost" },
    ],
  },
  { to: "/research", label: "Research" },
  { to: "/blog", label: "Blog" },
  {
    label: "About",
    id: "about-navigation",
    links: [
      { to: "/philosophy", label: "Philosophy" },
      { to: "/support", label: "Support" },
      { to: "/contact", label: "Contact" },
    ],
  },
]

export const Navigation = () => {
  const location = useLocation()
  const hideMobileLogo = location.pathname === "/"

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  const panelLink = (link: NavigationLink) => (
    <Link
      key={link.to}
      to={link.to}
      aria-current={isActive(link.to) ? "page" : undefined}
      className={`block rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
        isActive(link.to)
          ? "bg-slate-100 text-slate-950"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {link.label}
    </Link>
  )

  return (
    <nav
      aria-label="Primary"
      className="relative z-50 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link
          to="/"
          aria-current={location.pathname === "/" ? "page" : undefined}
          className="flex shrink-0 items-center gap-3"
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

        <div className="hidden items-center gap-1 text-sm md:flex">
          {navSections.map((section) => {
            if ("links" in section) {
              const active = section.links.some((link) => isActive(link.to))

              return (
                <details
                  key={section.id}
                  data-nav-group
                  name="primary-navigation"
                  className="group relative"
                >
                  <summary
                    aria-controls={section.id}
                    className={`flex cursor-pointer list-none items-center gap-1 px-3 py-2 transition-colors [&::-webkit-details-marker]:hidden ${
                      active
                        ? "font-semibold text-slate-950"
                        : "text-slate-700 hover:text-slate-950"
                    }`}
                  >
                    {section.label}
                    <span
                      aria-hidden="true"
                      className="text-xs transition-transform group-open:rotate-180"
                    >
                      ▾
                    </span>
                  </summary>
                  <div
                    id={section.id}
                    className="mobile-nav-panel absolute right-0 top-full z-[60] mt-3 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_50px_rgba(15,23,42,0.14)]"
                  >
                    {section.links.map(panelLink)}
                  </div>
                </details>
              )
            }

            const active = isActive(section.to)

            return (
              <Link
                key={section.to}
                to={section.to}
                aria-current={active ? "page" : undefined}
                className={`group relative px-3 py-2 transition-colors ${
                  active
                    ? "text-slate-950"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {section.label}
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

        <details data-mobile-navigation className="group relative md:hidden">
          <summary
            aria-controls={MOBILE_NAVIGATION_ID}
            className="flex h-11 w-11 list-none items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
          >
            <span className="sr-only">Navigation menu</span>
            <span aria-hidden="true" className="flex w-5 flex-col gap-1.5">
              <span className="h-0.5 rounded bg-current transition-transform group-open:translate-y-2 group-open:rotate-45" />
              <span className="h-0.5 rounded bg-current transition-opacity group-open:opacity-0" />
              <span className="h-0.5 rounded bg-current transition-transform group-open:-translate-y-2 group-open:-rotate-45" />
            </span>
          </summary>

          <div
            id={MOBILE_NAVIGATION_ID}
            className="mobile-nav-panel absolute right-0 top-full z-[60] mt-3 max-h-[calc(100dvh-6rem)] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_50px_rgba(15,23,42,0.14)]"
          >
            <div className="flex flex-col gap-1">
              {navSections.map((section) =>
                "links" in section ? (
                  <div
                    key={section.id}
                    role="group"
                    aria-label={section.label}
                    className="border-t border-slate-200 pt-2"
                  >
                    <p className="px-3 text-xs font-semibold text-slate-600">
                      {section.label}
                    </p>
                    <div className="pl-3">{section.links.map(panelLink)}</div>
                  </div>
                ) : (
                  panelLink(section)
                ),
              )}
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
