import type { Metadata } from "next"
import { db } from "@/db"
import { env } from "@/env.mjs"

import { ApplicationCard } from "@/components/cards/application-card"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shells/shell"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Applications",
  description: "Manage your applications",
}

export default async function ApplicationsPage() {
  const allApps = await db.query.applications.findMany()

  return (
    <Shell variant="sidebar">
      <PageHeader
        id="dashboard-applications-page-header"
        aria-labelledby="dashboard-applications-page-header-heading"
      >
        <div className="flex space-x-4">
          <PageHeaderHeading size="sm">Applications</PageHeaderHeading>
        </div>
        <PageHeaderDescription size="sm">
          Manage your applications
        </PageHeaderDescription>
      </PageHeader>
      <section
        id="dashboard-applications-page-applications"
        aria-labelledby="dashboard-applications-page-applications-heading"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {allApps.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            href={`/dashboard/applications/${app.id}/users`}
          />
        ))}
      </section>
    </Shell>
  )
}
