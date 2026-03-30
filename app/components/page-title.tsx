type Props = {
  title: string
  subtitle?: string
}

export const PageTitle: React.FC<Props> = ({ title, subtitle }) => (
  <div className="mb-8 max-w-3xl space-y-3">
    <h1 className="text-3xl tracking-tight md:text-4xl">{title}</h1>
    {subtitle ? <p className="text-base text-gray-600">{subtitle}</p> : null}
  </div>
)
