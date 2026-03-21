type Props = {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  url?: string
  onClick?: () => void
  children?: React.ReactNode
  actions?: React.ReactNode[]
  headingLevel?: 2 | 3 | 4
  className?: string
}

export const Card: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  url,
  onClick,
  children,
  actions,
  headingLevel = 3,
  className = "",
}) => {
  const HeadingTag = `h${headingLevel}` as const
  const content = (
    <>
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <HeadingTag className="text-xl font-bold leading-tight break-words">
            {title}
          </HeadingTag>
          {subtitle && (
            <p className="mt-1 text-sm leading-snug text-gray-500 break-words">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <p className="mt-4 grow text-base text-gray-700 leading-relaxed">
        {children}
      </p>
    </>
  )

  const cardClasses =
    "flex w-full flex-col overflow-hidden rounded-lg border border-gray-200 px-6 py-4 shadow-lg transition-all duration-300"
  const interactiveCardClasses =
    "hover:shadow-xl hover:scale-105 cursor-pointer"

  return (
    <div
      className={`${cardClasses} ${url || onClick ? interactiveCardClasses : ""} ${className}`}
    >
      {url ? (
        url.startsWith("http") ? (
          <ExternalLink href={url} className="flex h-full flex-col">
            {content}
          </ExternalLink>
        ) : (
          <a href={url} className="flex h-full flex-col">
            {content}
          </a>
        )
      ) : onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="flex h-full flex-col text-left"
        >
          {content}
        </button>
      ) : (
        <div className="flex h-full flex-col">{content}</div>
      )}
      {actions && actions.length > 0 && (
        <div className="mt-4 flex justify-end gap-2">
          {actions.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
        </div>
      )}
    </div>
  )
}
import { ExternalLink } from "./external-link"
