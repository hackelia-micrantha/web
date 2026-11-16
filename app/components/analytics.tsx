type Props = { nonce?: string }

// Default browser integration, pending approved Phenology hostname ownership.
export const Analytics = ({ nonce }: Props) => (
  <script
    defer
    nonce={nonce}
    src="https://analytics.micrantha.com/v1/sites/micrantha-web.js"
  ></script>
)
