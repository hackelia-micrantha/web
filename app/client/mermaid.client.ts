import mermaid from "mermaid"

export function installMermaidRenderer() {
  if (window.__micranthaRenderMermaid) return

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "neutral",
    themeCSS: `
      .nodeLabel p {
        font-size: 16px;
        line-height: 1.5;
      }
    `,
  })

  window.__micranthaRenderMermaid = async (id, chart) => {
    const result = await mermaid.render(id, chart)
    return result.svg
  }
}
