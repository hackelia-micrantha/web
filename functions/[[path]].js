import { createRequestHandler } from "@remix-run/server-runtime"
import * as build from "../build/index.js"

const handleRequest = createRequestHandler(build)

export const onRequest = (context) => handleRequest(context.request, context)
