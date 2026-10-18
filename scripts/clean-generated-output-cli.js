#!/usr/bin/env node
import { fileURLToPath } from "node:url"
import path from "node:path"
import { cleanGeneratedOutput } from "./clean-generated-output.js"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
await cleanGeneratedOutput(root, process.argv[2])
