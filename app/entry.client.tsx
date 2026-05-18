import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";

// Temporary production hardening: disable hydration until SSR/client mismatch is fully root-caused.
const ENABLE_HYDRATION = false;

async function renderMermaidDiagrams() {
  const diagramFigures = Array.from(
    document.querySelectorAll<HTMLElement>("[data-mermaid-diagram]"),
  );

  if (diagramFigures.length === 0) return;

  const mermaid = (await import("mermaid")).default;

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
  });

  await Promise.all(
    diagramFigures.map(async (figure, index) => {
      const source = figure.querySelector<HTMLElement>("[data-mermaid-source]");
      const chart = source?.textContent?.trim();

      if (!source || !chart) return;

      try {
        const result = await mermaid.render(`mermaid-${index}`, chart);
        const container = document.createElement("div");

        container.className = "overflow-x-auto rounded-2xl p-4";
        container.innerHTML = result.svg;
        source.replaceWith(container);
      } catch {
        source.className =
          "overflow-x-auto rounded-2xl p-4 text-sm leading-7 text-slate-100";
      }
    }),
  );
}

void renderMermaidDiagrams();

if (ENABLE_HYDRATION) {
  hydrateRoot(document, <RemixBrowser />);
}
