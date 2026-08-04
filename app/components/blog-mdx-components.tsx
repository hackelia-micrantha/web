import type { ReactNode } from "react"
import { Link } from "@remix-run/react"

export function Callout({ children }: { children: ReactNode }) {
  return <div className="article-callout">{children}</div>
}

export function Figure({
  alt,
  caption,
  narrow = false,
  src,
  title,
}: {
  alt: string
  caption: string
  narrow?: boolean
  src: string
  title: string
}) {
  return (
    <figure className="article-diagram">
      <figcaption className="article-diagram-caption">
        <span className="article-diagram-title">{title}</span>
        <span className="article-diagram-note">{caption}</span>
      </figcaption>
      <img
        className={
          narrow
            ? "article-diagram-image article-diagram-image-narrow"
            : "article-diagram-image"
        }
        src={src}
        alt={alt}
      />
    </figure>
  )
}

type ControlTableRow = {
  cause: string
  failureMode: string
  response: string
}

export function ControlTable({ rows }: { rows: ControlTableRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table
        aria-label="AI pipeline failure modes"
        className="min-w-[48rem] border-collapse text-left"
      >
        <thead>
          <tr>
            <th scope="col">Failure mode</th>
            <th scope="col">What usually causes it</th>
            <th scope="col">Control response</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.failureMode}>
              <th scope="row">{row.failureMode}</th>
              <td>{row.cause}</td>
              <td>{row.response}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PostLink({
  children,
  slug,
}: {
  children: ReactNode
  slug: string
}) {
  return <Link to={`/blog/${slug}`}>{children}</Link>
}

export const blogMdxComponents = {
  Callout,
  ControlTable,
  Figure,
  PostLink,
}
