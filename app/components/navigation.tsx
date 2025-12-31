import { Link, NavLink, useLocation } from "@remix-run/react"
import { GithubIcon } from "~/components/icons"

export const Navigation = () => {
  const { pathname, hash } = useLocation()
  const isHome = pathname === "/"
  const currentHash = isHome ? hash : ""

  return (
    <nav className="flex flex-wrap items-stretch justify-between">
      <div className="m-3 flex flex-shrink-0 items-center">
        <Link to="/">
          <img
            src="/img/logo.png"
            width="48"
            height="48"
            alt="logo"
            className="mr-3"
          />
        </Link>
        <Link to="/" className="text-xl font-semibold tracking-tight">
          Micrantha
        </Link>
      </div>
      <div className="flex items-stretch">
        <Link
          to="/#services"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
          aria-current={currentHash === "#services" ? "page" : undefined}
        >
          Services
        </Link>
        <Link
          to="/#solutions"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
          aria-current={currentHash === "#solutions" ? "page" : undefined}
        >
          Solutions
        </Link>
        <Link
          to="/#laboratory"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
          aria-current={currentHash === "#laboratory" ? "page" : undefined}
        >
          Laboratory
        </Link>
        <Link
          to="/#philosophy"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
          aria-current={currentHash === "#philosophy" ? "page" : undefined}
        >
          Philosophy
        </Link>
        <Link
          to="/#contact"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
          aria-current={currentHash === "#contact" ? "page" : undefined}
        >
          Contact
        </Link>
        <NavLink
          to="/support"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Support
        </NavLink>
        <a
          href="https://github.com/hackelia-micrantha"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
          aria-label="Micrantha GitHub"
        >
          <GithubIcon />
        </a>
      </div>
    </nav>
  )
}
