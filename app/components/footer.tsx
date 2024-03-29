import { Link } from "@remix-run/react"

export const Footer = ({ fortune }: { fortune: string | undefined }) => (
  <footer className="mt-16 flex flex-col items-center justify-center">
    <div>
      <Link to="/privacy">Privacy</Link> |{" "}
      <Link to="/philosophy">Philosophy</Link>
    </div>

    {fortune ? (
      <div className="mx-10 mt-4">&#10077; {fortune} &#10078;</div>
    ) : null}

    <div className="mt-2">
      &copy; All Rights Reserved{" "}
      <a href="https://micrantha.com">Micrantha Software Solutions</a>
    </div>
  </footer>
)
