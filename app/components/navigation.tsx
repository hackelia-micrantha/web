import { Link } from "@remix-run/react"
import { GithubIcon } from "~/components/icons"

export const Navigation = () => (
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
        to="/support"
        className="flex items-center justify-center px-3 hover:bg-gray-100"
      >
        Support
      </Link>
      <a
        href="https://github.com/hackelia-micrantha"
        className="flex items-center justify-center px-3 hover:bg-gray-100"
      >
        <GithubIcon />
      </a>
    </div>
  </nav>
)
