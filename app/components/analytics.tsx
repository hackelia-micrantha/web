type Props = { nonce?: string }

// Default browser integration, pending approved Phenology hostname ownership.
export const Analytics = ({ nonce }: Props) => (
  <script
    defer
    nonce={nonce}
    src="https://analytics.micrantha.com/v1/sites/micrantha-web.js"
    integrity="sha384-s7W4Rqhd9Bym5x4+9q8KNBPgnLrhzPIOItA5tX2MwfaHOMbU9smTCVdVAdfLn2M/"
    crossOrigin="anonymous"
    referrerPolicy="no-referrer"
  ></script>
)
