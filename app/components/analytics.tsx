type Props = {
  id: string | null | undefined
  nonce?: string
}

export const Analytics = ({ id, nonce }: Props) => {
  if (!id) return null

  return (
    <script
      async
      defer
      data-website-id={id}
      nonce={nonce}
      src="https://analytics.micrantha.com/umami.js"
    ></script>
  )
}
