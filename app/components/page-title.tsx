type Props = {
  title: string
  subtitle?: string
}

export const PageTitle: React.FC<Props> = ({ title, subtitle }) => (
  <div className="mb-4">
    <h1 className="text-2xl">{title}</h1>
    {subtitle ? <h2 className="mt-3 mb-8 italic">{subtitle}</h2> : null}
  </div>
)
