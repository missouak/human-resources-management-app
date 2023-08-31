"use client"

import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ApplicationTabsProps
  extends React.ComponentPropsWithoutRef<typeof Tabs> {
  tabs: { title: string; href: string }[]
}

export function ApplicationTabs({
  className,
  tabs,
  ...props
}: ApplicationTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Tabs
      {...props}
      className={cn("w-full overflow-x-auto", className)}
      onValueChange={(value) => router.push(value)}
    >
      <TabsList className="rounded-md">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.title}
            value={tab.href}
            className={cn(
              "rounded-sm",
              pathname === tab.href && "bg-background text-foreground shadow-sm"
            )}
            onClick={() => router.push(tab.href)}
          >
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
