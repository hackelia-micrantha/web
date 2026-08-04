import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { isValidElement } from "react"
import { Link } from "@remix-run/react"

import { MermaidDiagram } from "./mermaid-diagram"

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

type MermaidCodeElementProps = {
  children?: ReactNode
  className?: string
}

type ParsedMermaidSource = {
  caption: string
  chart: string
  title: string
}

function metadataValue(line: string | undefined, prefix: string, name: string) {
  if (!line?.startsWith(prefix)) {
    throw new Error(`Mermaid code block is missing its ${name} metadata line`)
  }

  const value = line.slice(prefix.length).trim()

  if (value === "") {
    throw new Error(`Mermaid code block ${name} must not be empty`)
  }

  return value
}

export function parseBlogMermaidSource(source: string): ParsedMermaidSource {
  const normalized = source.replaceAll("\r\n", "\n").trim()
  const [titleLine, captionLine, ...chartLines] = normalized.split("\n")
  const title = metadataValue(titleLine, "%% title:", "title")
  const caption = metadataValue(captionLine, "%% caption:", "caption")
  const chart = chartLines.join("\n").trim()

  if (title.length > 160) {
    throw new Error("Mermaid code block title exceeds 160 characters")
  }

  if (caption.length > 320) {
    throw new Error("Mermaid code block caption exceeds 320 characters")
  }

  if (chart === "" || chart.length > 4_000) {
    throw new Error("Mermaid chart must contain between 1 and 4000 characters")
  }

  if (!/^(?:flowchart|graph)\s+(?:TB|TD|BT|RL|LR)\b/u.test(chart)) {
    throw new Error("Mermaid chart must be a directed flowchart")
  }

  if (/%%\{|\b(?:click|href)\b|javascript:/iu.test(chart)) {
    throw new Error("Mermaid chart contains a forbidden directive or link")
  }

  if (/<\/?[A-Za-z][^>]*>/u.test(chart)) {
    throw new Error("Mermaid chart must not contain HTML")
  }

  const hasForbiddenControlCharacter = [...chart].some((character) => {
    const codePoint = character.codePointAt(0)
    return codePoint < 0x20 && codePoint !== 0x09 && codePoint !== 0x0a
  })

  if (hasForbiddenControlCharacter) {
    throw new Error("Mermaid chart contains control characters")
  }

  return { caption, chart, title }
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
}
