import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import prettier from "prettier"

import {
  loadProjectRegistryProjection,
  validateProjectRegistryProjection,
} from "./project-registry-projection.js"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
export const outputPath = path.join(
  root,
  "app/data/project-registry.generated.js",
)

export const renderProjectRegistryRuntime = async (snapshot, presentation) => {
  const raw = `// Generated from the reviewed project registry projection. Do not edit by hand.\nexport const projectRegistrySnapshot = ${JSON.stringify(snapshot, null, 2)}\n\nexport const projectPresentation = ${JSON.stringify(presentation, null, 2)}\n`

  const config = (await prettier.resolveConfig(outputPath)) ?? {}
  return prettier.format(raw, { ...config, filepath: outputPath })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { snapshot, presentation } = loadProjectRegistryProjection()
  validateProjectRegistryProjection(snapshot, presentation)
  fs.writeFileSync(
    outputPath,
    await renderProjectRegistryRuntime(snapshot, presentation),
  )
  console.log(`Generated ${path.relative(root, outputPath)}`)
}
