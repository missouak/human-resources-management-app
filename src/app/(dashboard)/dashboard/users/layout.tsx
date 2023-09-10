import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shells/shell"

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Shell variant="sidebar">
      <div className="flex items-center space-x-4 pr-1">
        <PageHeader className="flex-1">
          <PageHeaderHeading size="sm">Users Management</PageHeaderHeading>
          <PageHeaderDescription size="sm">
            Manage your users
          </PageHeaderDescription>
        </PageHeader>
      </div>
      <div className="space-y-4 overflow-hidden">{children}</div>
    </Shell>
  )
}
