import { useEffect, useId, useState } from "react"

type MermaidDiagramProps = {
  title: string
  caption?: string
  chart: string
}

const MERMAID_READY_EVENT = "micrantha:mermaid-ready"

declare global {
  interface Window {
    __micranthaRenderMermaid?: (id: string, chart: string) => Promise<string>
  }
}

export function MermaidDiagram({ title, caption, chart }: MermaidDiagramProps) {
  const reactId = useId()
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true

    setSvg(null)
    setFailed(false)

    const render = () => {
      const renderer = window.__micranthaRenderMermaid

      if (!renderer) return

      void renderer(diagramId, chart)
        .then((renderedSvg) => {
          if (active) {
            setSvg(renderedSvg)
          }
        })
        .catch(() => {
          if (active) {
            setFailed(true)
          }
        })
    }

    if (window.__micranthaRenderMermaid) {
      render()
    } else {
      window.addEventListener(MERMAID_READY_EVENT, render, { once: true })
    }

    return () => {
      active = false
      window.removeEventListener(MERMAID_READY_EVENT, render)
    }
  }, [chart, diagramId])

  return (
    <figure
      className="article-diagram mb-10"
      data-mermaid-diagram
      data-mermaid-status={svg ? "rendered" : failed ? "error" : "source"}
    >
      <figcaption className="article-diagram-caption">
        <span className="article-diagram-title">{title}</span>
        {caption ? (
          <span className="article-diagram-note">{caption}</span>
        ) : null}
      </figcaption>

      {svg ? (
        <div
          className="overflow-x-auto rounded-2xl p-4"
          data-mermaid-rendered
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre
          className={`overflow-x-auto rounded-2xl p-4 text-sm leading-7 ${
            failed ? "text-slate-100" : "text-slate-700"
          }`}
          data-mermaid-source
        >
          {chart}
        </pre>
      )}
    </figure>
  )
}
