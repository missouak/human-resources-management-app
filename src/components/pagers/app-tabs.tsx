"use client"

import { useRouter, useSelectedLayoutSegment } from "next/navigation"
import type { Tab } from "@/types"
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface ApplicationTabsProps {
  tabs: Tab[]
}

export function ApplicationTabs({ tabs }: ApplicationTabsProps) {
  const router = useRouter()
  const segment = useSelectedLayoutSegment()

  return (
    <Tabs
      defaultValue={
        tabs.find((tab) => tab.segment === segment)?.href ?? tabs[0]?.href
      }
      className="sticky top-0 z-30 w-full overflow-auto bg-background px-1"
      onValueChange={(value) => router.push(value)}
    >
      <TabsList className="inline-flex items-center justify-center space-x-1.5 text-muted-foreground">
        {tabs.map((tab) => {
          const isActive = tab.segment === segment
          return (
            <div
              role="none"
              key={tab.href}
              className={cn(
                "border-b-2 border-transparent py-1.5",
                isActive && "border-foreground"
              )}
            >
              <TabsTrigger
                value={tab.href}
                className={cn(
                  "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground ring-offset-background transition-all hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  isActive && "text-foreground"
                )}
              >
                {tab.title}
              </TabsTrigger>
            </div>
          )
        })}
      </TabsList>
      <Separator />
    </Tabs>
  )
}
