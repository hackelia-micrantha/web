import mermaid from "mermaid"

export function installMermaidRenderer() {
  if (window.__micranthaRenderMermaid) return

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "neutral",
    themeVariables: {
      background: "transparent",
      clusterBkg: "#fcfbf7",
      clusterBorder: "#cbd5e1",
      edgeLabelBackground: "#fcfbf7",
      lineColor: "#234c3e",
      mainBkg: "#fcfbf7",
      nodeBkg: "#d3e4de",
      nodeBorder: "#2f6b55",
      primaryBorderColor: "#2f6b55",
      primaryColor: "#d3e4de",
      primaryTextColor: "#1f2a2a",
      secondaryBorderColor: "#2f6b55",
      secondaryColor: "#f4efe3",
      secondaryTextColor: "#1f2a2a",
      tertiaryBorderColor: "#2f6b55",
      tertiaryColor: "#fcfbf7",
      tertiaryTextColor: "#1f2a2a",
      textColor: "#1f2a2a",
    },
    themeCSS: `
      .nodeLabel p {
        font-size: 15px;
        line-height: 1.5;
      }
      .edgeLabel {
        font-size: 13px;
      }
      .edgeLabel p {
        background-color: #fcfbf7;
        padding: 0 4px;
      }
    `,
  })

  window.__micranthaRenderMermaid = async (id, chart) => {
    const result = await mermaid.render(id, chart)
    return result.svg
  }
}
