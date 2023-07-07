type Props = {
  title: string
  icon?: React.ReactNode
  url?: string
  children?: React.ReactNode
}

export const Card: React.FC<Props> = ({ icon, title, url, children }) => (
  <div className="flex max-w-sm flex-col overflow-hidden rounded px-6 py-4 shadow-lg">
    <div className="flex items-center">
      <div className="flex h-8 w-8 items-center justify-center">{icon}</div>
      <div className="text-xl font-bold">{title}</div>
    </div>
    <p className="mt-4 grow flex-col justify-between text-base text-gray-700">
      {children}
    </p>
    {url ? (
      <div className="mt-4 flex justify-center justify-self-end border-t pt-4">
        <a href={url}>Visit</a>
      </div>
    ) : null}
  </div>
)
