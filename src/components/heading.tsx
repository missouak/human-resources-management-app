interface HeadingProps {
  title: string
  description: string
}

export function Heading({ title, description }: HeadingProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
