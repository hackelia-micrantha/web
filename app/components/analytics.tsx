type Props = {
  enabled?: boolean
  nonce?: string
}

// Source-only integration contract: this URL must not be enabled before
// Phenology owns the hostname and the browser/runtime gates are approved.
export const Analytics = ({ enabled, nonce }: Props) => {
  if (!enabled) return null

  return (
    <script
      defer
      nonce={nonce}
      src="https://analytics.micrantha.com/v1/sites/micrantha-web.js"
    ></script>
  )
}
