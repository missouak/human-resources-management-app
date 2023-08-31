import { notFound, redirect } from "next/navigation"

import { prisma } from "@/lib/db"
import { PageHeaderHeading } from "@/components/page-header"
import { AppSwitcher } from "@/components/pagers/app-switcher"
import { ApplicationTabs } from "@/components/pagers/app-tabs"
import { Shell } from "@/components/shells/shell"

interface StoreLayoutProps {
  children: React.ReactNode
  params: {
    slug: string
  }
}

export default async function ApplicationLayout({
  children,
  params,
}: StoreLayoutProps) {
  const tabs = [
    {
      title: "Application",
      href: `/dashboard/applications/${params.slug}`,
    },
    {
      title: "Users",
      href: `/dashboard/applications/${params.slug}/users`,
    },
    {
      title: "Actions",
      href: `/dashboard/applications/${params.slug}/actions`,
    },
    {
      title: "Analytics",
      href: `/dashboard/applications/${params.slug}/analytics`,
    },
  ]

  const user = {}

  if (!user) {
    redirect("/signin")
  }

  const allApps = await prisma.application.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  const app = allApps.find((app) => app.slug === params.slug)

  if (!app) {
    notFound()
  }

  return (
    <Shell variant="sidebar" className="gap-4">
      <div className="flex items-center space-x-4 pr-1">
        <PageHeaderHeading className="line-clamp-1 flex-1" size="sm">
          {app.name}
        </PageHeaderHeading>
        {allApps.length > 1 ? (
          <AppSwitcher
            apps={allApps}
            currentApp={app}
            dashboardRedirectPath="/dashboard/applications"
          />
        ) : null}
      </div>
      <div className="space-y-4 overflow-hidden">
        <ApplicationTabs tabs={tabs} />
        {children}
      </div>
    </Shell>
  )
}
