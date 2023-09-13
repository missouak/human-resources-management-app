import { SidebarNavItem } from "@/types"

export function getDashboardSidebarNav(): SidebarNavItem[] {
  return [
    {
      title: "Applications",
      href: "/dashboard/applications",
      items: [],
      icon: "layout",
    },
    { title: "Users", items: [], href: "/dashboard/users", icon: "user" },
    {
      title: "Departments",
      items: [],
      href: "/dashboard/departments",
      icon: "department",
    },
    {
      title: "Employees",
      items: [],
      href: "/dashboard/employees",
      icon: "users",
    },
    {
      title: "Leaves",
      items: [],
      href: "/dashboard/leaves",
      icon: "calendar",
    },
    {
      title: "Absences",
      items: [],
      href: "/dashboard/absences",
      icon: "userX",
    },
    {
      title: "Internships",
      items: [],
      href: "/dashboard/internships",
      icon: "gradaution",
    },
  ] satisfies SidebarNavItem[]
}
