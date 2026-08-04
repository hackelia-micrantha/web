import type { LoaderFunctionArgs } from "@remix-run/node"

import { assertRuntimeContractEnabled } from "../services/runtime-contract.server"

export const loader = ({ context, request }: LoaderFunctionArgs) => {
  assertRuntimeContractEnabled(context, request)

  throw new Error("Controlled Cloudflare runtime contract failure")
}

export default function RuntimeContractError() {
  return null
}
