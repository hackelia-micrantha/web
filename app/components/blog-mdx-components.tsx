import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { isValidElement, useId } from "react"
import { Link } from "@remix-run/react"

import { MermaidDiagram } from "./mermaid-diagram"
import { parseBlogMermaidSource } from "~/content/blog-mermaid.js"

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

function ScrollableTableFrame({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  const hintId = useId()

  return (
    <div className="article-table-frame">
      <p id={hintId} className="article-table-scroll-hint">
        Scroll horizontally if needed to view all columns.
      </p>
      <div
        aria-describedby={hintId}
        aria-label={label}
        className="article-table-scroll overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2"
        role="region"
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  )
}

export function BlogMdxTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <ScrollableTableFrame label="Scrollable article table">
      <table {...props} />
    </ScrollableTableFrame>
  )
}

export function ControlTable({ rows }: { rows: ControlTableRow[] }) {
  return (
    <ScrollableTableFrame label="AI pipeline failure modes table">
      <table
        aria-label="AI pipeline failure modes"
        className="article-control-table min-w-[48rem] border-collapse text-left"
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
    </ScrollableTableFrame>
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

type MermaidCodeElementProps = {
  children?: ReactNode
  className?: string
}

export function BlogMdxPre({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  if (
    !isValidElement<MermaidCodeElementProps>(children) ||
    children.props.className !== "language-mermaid"
  ) {
    return <pre {...props}>{children}</pre>
  }

  if (typeof children.props.children !== "string") {
    throw new Error("Mermaid code block source must be plain text")
  }

  return <MermaidDiagram {...parseBlogMermaidSource(children.props.children)} />
}

export const blogMdxComponents = {
  Callout,
  ControlTable,
  Figure,
  PostLink,
  pre: BlogMdxPre,
  table: BlogMdxTable,
}
