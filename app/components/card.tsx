type Props = {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  url?: string
  onClick?: () => void
  children?: React.ReactNode
  actions?: React.ReactNode[]
}

export const Card: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  url,
  onClick,
  children,
  actions,
}) => {
  const content = (
    <>
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className="flex h-8 w-8 items-center justify-center"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <div>
          <div className="text-xl font-bold">{title}</div>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <p className="mt-4 grow text-base text-gray-700">{children}</p>
    </>
  )

  const cardClasses =
    "flex max-w-sm flex-col overflow-hidden rounded-lg border border-gray-200 px-6 py-4 shadow-lg transition-all duration-300"
  const interactiveCardClasses =
    "hover:shadow-xl hover:scale-105 cursor-pointer"

  return (
    <div
      className={`${cardClasses} ${url || onClick ? interactiveCardClasses : ""}`}
    >
      {url ? (
        <a href={url} className="flex h-full flex-col">
          {content}
        </a>
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
        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          {actions.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
        </div>
      )}
    </div>
  )
}
