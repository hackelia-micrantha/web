import { Link } from "@remix-run/react"

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
    <div className="block lg:hidden">
      <button className="flex items-center rounded border px-3 py-2">
        <svg
          className="h-3 w-3 fill-current"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </button>
    </div>
    <div className="flex items-stretch">
      {/* <Link to="/services" className="px-3 hover:bg-gray-100 flex items-center justify-center">
          Services
        </Link> */}
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
    </div>
  </nav>
)
