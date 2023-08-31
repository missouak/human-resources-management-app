import { SidebarNavItem } from "@/types"

export function getDashboardSidebarNav(user: any): SidebarNavItem[] {
  const sidebarNav = [
    {
      title: "Applications",
      href: "/dashboard/applications",
      items: [],
      icon: "layout",
    },
  ] satisfies SidebarNavItem[]
  if (user?.privateMetadata.role === "superAdmin") {
    return [
      ...sidebarNav,
      { title: "Users", items: [], href: "/dashboard/users", icon: "user" },
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
  return sidebarNav
}
