type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  newTab?: boolean
}

export const ExternalLink: React.FC<Props> = ({
  newTab = false,
  rel,
  target,
  children,
  ...props
}) => {
  const resolvedTarget = newTab ? "_blank" : target
  const fallbackRel =
    resolvedTarget === "_blank" ? "noopener noreferrer" : "noreferrer"
  const resolvedRel = rel ? `${fallbackRel} ${rel}` : fallbackRel

  return (
    <a {...props} rel={resolvedRel} target={resolvedTarget}>
      {children}
    </a>
  )
}
