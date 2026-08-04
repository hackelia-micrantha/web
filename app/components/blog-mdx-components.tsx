import type { ReactNode } from "react"
import { Link } from "@remix-run/react"

type CalloutProps = {
  children: ReactNode
}

export function Callout({ children }: CalloutProps) {
  return (
    <aside className="article-callout" aria-label="Key point">
      {children}
    </aside>
  )
}

type FigureProps = {
  alt: string
  caption: string
  src: string
  title: string
  narrow?: boolean
}

export function Figure({ alt, caption, src, title, narrow }: FigureProps) {
  return (
    <figure
      className={`article-figure${narrow ? " article-figure-narrow" : ""}`}
    >
      <div className="article-figure-heading">
        <h2>{title}</h2>
        <p>{caption}</p>
      </div>
      <div className="article-figure-canvas">
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      </div>
    </figure>
  )
}

type PostLinkProps = {
  children: ReactNode
  slug: string
}

export function PostLink({ children, slug }: PostLinkProps) {
  return <Link to={`/blog/${slug}`}>{children}</Link>
}

export const blogMdxComponents = {
  Callout,
  Figure,
  PostLink,
}
