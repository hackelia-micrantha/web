import type { LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"

import { assertRuntimeContractEnabled } from "../services/runtime-contract.server"

const REDIRECT_TARGET = "/blog/ai-pipelines-need-control-boundaries"

export const loader = ({ context, request }: LoaderFunctionArgs) => {
  assertRuntimeContractEnabled(context, request)

  return redirect(REDIRECT_TARGET, {
    status: 302,
    headers: {
      "Cache-Control": "private, no-store",
    },
  })
}

export default function RuntimeContractRedirect() {
  return null
}
