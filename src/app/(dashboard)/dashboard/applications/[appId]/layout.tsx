import { notFound } from "next/navigation"
import { db } from "@/db"
import { Tab } from "@/types"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { AppSwitcher } from "@/components/pagers/app-switcher"
import { ApplicationTabs } from "@/components/pagers/app-tabs"
import { Shell } from "@/components/shells/shell"

interface StoreLayoutProps {
  children: React.ReactNode
  params: {
    appId: string
  }
}

export default async function ApplicationLayout({
  children,
  params,
}: StoreLayoutProps) {
  const tabs = [
    {
      title: "Users",
      href: `/dashboard/applications/${params.appId}/users`,
      segment: "users",
    },
    {
      title: "Actions",
      href: `/dashboard/applications/${params.appId}/actions`,
      segment: "actions",
    },
    {
      title: "Analytics",
      href: `/dashboard/applications/${params.appId}/analytics`,
      segment: "analytics",
    },
  ] satisfies Tab[]

  const allApps = await db.query.applications.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
    },
  })

  const app = allApps.find((app) => app.id === params.appId)

  if (!app) {
    notFound()
  }

  return (
    <Shell variant="sidebar">
      <div className="flex items-center space-x-4 pr-1">
        <PageHeader className="flex-1">
          <PageHeaderHeading size="sm">{app.name}</PageHeaderHeading>
          <PageHeaderDescription size="sm">
            {app.description}
          </PageHeaderDescription>
        </PageHeader>
        {allApps.length > 1 ? (
          <AppSwitcher
            apps={allApps}
            currentApp={app}
            dashboardRedirectPath="/dashboard/applications"
          />
        ) : null}
      </div>
      <div className="space-y-8 overflow-auto">
        <ApplicationTabs tabs={tabs} />
        {children}
      </div>
    </Shell>
  )
}
