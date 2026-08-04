function metadataValue(line, prefix, name) {
  if (!line?.startsWith(prefix)) {
    throw new Error(`Mermaid code block is missing its ${name} metadata line`)
  }

  const value = line.slice(prefix.length).trim()

  if (value === "") {
    throw new Error(`Mermaid code block ${name} must not be empty`)
  }

  return value
}

export function parseBlogMermaidSource(source) {
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
