import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { EmployeesTabs } from "@/components/pagers/employeesTabs"
import { Shell } from "@/components/shells/shell"

interface EmployeesLayoutProps {
  children: React.ReactNode
}

export default function EmployeesLayout({ children }: EmployeesLayoutProps) {
  return (
    <Shell variant="sidebar">
      <div className="flex items-center space-x-4 pr-1">
        <PageHeader className="flex-1">
          <PageHeaderHeading size="sm">Employees Management</PageHeaderHeading>
          <PageHeaderDescription size="sm">
            Manage your employees
          </PageHeaderDescription>
        </PageHeader>
      </div>
      <div className="space-y-6 overflow-hidden">
        <EmployeesTabs />
        {children}
      </div>
    </Shell>
  )
}
