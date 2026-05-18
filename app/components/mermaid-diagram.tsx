import { useEffect, useId, useMemo, useState } from "react"

type MermaidDiagramProps = {
  title: string
  caption?: string
  chart: string
}

export function MermaidDiagram({ title, caption, chart }: MermaidDiagramProps) {
  const reactId = useId()
  const diagramId = useMemo(
    () => `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [reactId],
  )
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function renderDiagram() {
      try {
        const mermaid = (await import("mermaid")).default

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
        })

        const result = await mermaid.render(diagramId, chart)

        if (!cancelled) {
          setSvg(result.svg)
          setError(null)
        }
      } catch (caught) {
        if (!cancelled) {
          setSvg(null)
          setError(caught instanceof Error ? caught.message : "Unable to render diagram")
        }
      }
    }

    renderDiagram()

    return () => {
      cancelled = true
    }
  }, [chart, diagramId])

  return (
    <figure className="article-diagram">
      <figcaption className="article-diagram-caption">
        <span className="article-diagram-title">{title}</span>
        {caption ? <span className="article-diagram-note">{caption}</span> : null}
      </figcaption>

      {svg ? (
        <div
          className="overflow-x-auto rounded-2xl bg-white p-4"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : error ? (
        <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-slate-100">
          {chart}
        </pre>
      ) : (
        <pre className="overflow-x-auto rounded-2xl bg-slate-100 p-4 text-sm leading-7 text-slate-700">
          {chart}
        </pre>
      )}
    </figure>
  )
}
