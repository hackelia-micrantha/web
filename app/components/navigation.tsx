import { GithubIcon } from "~/components/icons"

export const Navigation = () => {
  return (
    <nav className="flex flex-wrap items-stretch justify-between">
      <div className="m-3 flex flex-shrink-0 items-center">
        <a href="/">
          <img
            src="/img/logo.png"
            width="48"
            height="48"
            alt="logo"
            className="mr-3"
          />
        </a>
        <a href="/" className="text-xl font-semibold tracking-tight">
          Micrantha
        </a>
      </div>
      <div className="flex items-stretch">
        <a
          href="/#services"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Services
        </a>
        <a
          href="/solutions"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Solutions
        </a>
        <a
          href="/laboratory"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Laboratory
        </a>
        <a
          href="/philosophy"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Philosophy
        </a>
        <a
          href="/#contact"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Contact
        </a>
        <a
          href="/support"
          className="flex items-center justify-center px-3 hover:bg-gray-100"
        >
          Support
        </a>
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
