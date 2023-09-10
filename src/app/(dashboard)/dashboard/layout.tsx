import { redirect } from "next/navigation"
import type { MainNavItem, NavItemWithChildren } from "@/types"

import { getDashboardSidebarNav } from "@/config/dashboard"
import { currentProfile } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarNav } from "@/components/layouts/sidebar-nav"
import { SiteHeader } from "@/components/layouts/site-header"

interface LayoutProps {
  children: React.ReactNode
}

export default async function Layout({ children }: LayoutProps) {
  const profile = await currentProfile()

  if (!profile) {
    redirect("/signin")
  }

  if (profile.role === "user") redirect("/")

  const apps = await prisma.application.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      actions: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
    },
  })

  const navItems = apps.map(
    (app) =>
      ({
        title: app.name,
        href: `/${app.slug}`,
        items: app.actions.map(
          (action) =>
            ({
              title: action.name,
              description: action.description,
              href: `/${app.slug}/${action.slug}`,
              items: [],
            }) satisfies NavItemWithChildren
        ),
      }) satisfies MainNavItem
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={profile} navItems={navItems} />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <ScrollArea className="py-6 pr-6 lg:py-8">
            <SidebarNav items={getDashboardSidebarNav()} className="p-1" />
          </ScrollArea>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
