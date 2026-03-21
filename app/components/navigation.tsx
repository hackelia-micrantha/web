import { Link } from "@remix-run/react"
import { GithubIcon } from "~/components/icons"
import { ExternalLink } from "./external-link"

export const Navigation = () => {
  return (
    <nav className="flex flex-wrap items-stretch justify-between">
      <div className="m-3 flex flex-shrink-0 items-center">
        <Link to="/" aria-label="Micrantha home">
          <img
            src="/img/logo.svg"
            width="48"
            height="48"
            alt="Micrantha logo"
            className="mr-3"
          />
        </Link>
        <Link to="/" className="text-xl font-semibold tracking-tight">
          Micrantha
        </Link>
      </div>
      <div className="flex items-stretch">
        <Link
          to="/services"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Services
        </Link>
        <Link
          to="/solutions"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Solutions
        </Link>
        <Link
          to="/laboratory"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Laboratory
        </Link>
        <Link
          to="/philosophy"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Philosophy
        </Link>
        <Link
          to="/support"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Support
        </Link>
        <ExternalLink
          href="https://github.com/hackelia-micrantha"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
          aria-label="Micrantha GitHub"
        >
          <GithubIcon />
        </ExternalLink>
      </div>
    </nav>
  )
}
