type MermaidDiagramProps = {
  title: string;
  caption?: string;
  chart: string;
};

export function MermaidDiagram({ title, caption, chart }: MermaidDiagramProps) {
  return (
    <figure className="article-diagram mb-10" data-mermaid-diagram>
      <figcaption className="article-diagram-caption">
        <span className="article-diagram-title">{title}</span>
        {caption ? (
          <span className="article-diagram-note">{caption}</span>
        ) : null}
      </figcaption>

      <pre
        className="overflow-x-auto rounded-2xl p-4 text-sm leading-7 text-slate-700"
        data-mermaid-source
      >
        {chart}
      </pre>
    </figure>
  );
}
