type Props = {
  id: string | null | undefined
}

export const Analytics = ({ id }: Props) => {
  return (
    <script
      async
      defer
      data-website-id={id || "d664cd1b-9690-4e09-aeb1-664347a2b0a0"}
      src="https://analytics.micrantha.com/umami.js"
    ></script>
  )
}
