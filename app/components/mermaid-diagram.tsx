import { useEffect, useId, useState } from "react"

type MermaidDiagramProps = {
  title: string
  caption?: string
  chart: string
}

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

    const render = async () => {
      try {
        if (!window.__micranthaRenderMermaid) {
          const { installMermaidRenderer } =
            await import("../client/mermaid.client")
          installMermaidRenderer()
        }

        const renderer = window.__micranthaRenderMermaid

        if (!renderer) {
          throw new Error("Mermaid renderer did not initialize")
        }

        const renderedSvg = await renderer(diagramId, chart)

        if (active) {
          setSvg(renderedSvg)
        }
      } catch {
        if (active) {
          setFailed(true)
        }
      }
    }

    void render()

    return () => {
      active = false
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
