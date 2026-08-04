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
  Figure,
  PostLink,
}
