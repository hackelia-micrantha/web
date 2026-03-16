type Props = {
  id: string | null | undefined
}

export const Analytics = ({ id }: Props) => {
  if (!id) return null

  return (
    <script
      async
      defer
      data-website-id={id}
      src="https://analytics.micrantha.com/umami.js"
    ></script>
  )
}
