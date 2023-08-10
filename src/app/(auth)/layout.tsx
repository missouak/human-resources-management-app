interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="container absolute top-1/2 -translate-y-1/2">
      {children}
    </div>
  )
}
