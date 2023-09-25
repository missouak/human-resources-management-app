import { notFound } from "next/navigation"
import { db } from "@/db"
import type { Tab } from "@/types"

import { PageHeader, PageHeaderHeading } from "@/components/page-header"
import { ApplicationTabs } from "@/components/pagers/app-tabs"
import { DepartmentSwitcher } from "@/components/pagers/departement-switcher"
import { Shell } from "@/components/shells/shell"

interface DepartmentLayoutProps {
  children: React.ReactNode
  params: {
    departmentId: string
  }
}

export default async function DepartmentLayout({
  children,
  params,
}: DepartmentLayoutProps) {
  const tabs = [
    {
      title: "Department",
      href: `/dashboard/departments/${params.departmentId}`,
      segment: null,
    },
    {
      title: "Services",
      href: `/dashboard/departments/${params.departmentId}/services`,
      segment: "services",
    },
    {
      title: "Analytics",
      href: `/dashboard/departments/${params.departmentId}/analytics`,
      segment: "analytics",
    },
  ] satisfies Tab[]

  const allDepartments = await db.query.departments.findMany({
    columns: {
      id: true,
      name: true,
    },
  })

  const department = allDepartments.find(
    (department) => department.id === params.departmentId
  )

  if (!department) {
    notFound()
  }

  return (
    <Shell variant="sidebar">
      <div className="flex items-center space-x-4 pr-1">
        <PageHeader className="flex-1">
          <PageHeaderHeading size="sm">{department.name}</PageHeaderHeading>
        </PageHeader>
        {allDepartments.length > 1 ? (
          <DepartmentSwitcher
            departments={allDepartments}
            currentDepartment={department}
            dashboardRedirectPath="/dashboard/departments"
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
