type Props = {
  title: string
  subtitle?: string
}

export const PageTitle: React.FC<Props> = ({ title, subtitle }) => (
  <div className="page-title mb-10 space-y-4">
    <h1>{title}</h1>
    {subtitle ? <p>{subtitle}</p> : null}
  </div>
)
