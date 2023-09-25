"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { Application } from "@/db/schema"

import { getRandomPatternStyle } from "@/lib/generate-pattern"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Icons } from "@/components/icons"

interface AppSwitcherProps
  extends React.ComponentPropsWithoutRef<typeof PopoverTrigger> {
  currentApp: Pick<Application, "id" | "name">
  apps: Pick<Application, "id" | "name">[]
  dashboardRedirectPath: string
}

export function AppSwitcher({
  currentApp,
  apps,
  dashboardRedirectPath,
  className,
  ...props
}: AppSwitcherProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          aria-label="Select a store"
          className={cn(
            "w-[140px] justify-between px-3 sm:w-[180px]",
            className
          )}
          {...props}
        >
          <div
            className="mr-2 aspect-square h-4 w-4 rounded-full"
            style={getRandomPatternStyle(String(currentApp.id))}
          />
          <span className="truncate">{currentApp.name}</span>
          <Icons.chevronUpDown
            className="ml-auto h-4 w-4 shrink-0 opacity-50"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] p-0 sm:w-[180px]">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search App..." />
            <CommandEmpty>No application found.</CommandEmpty>
            <CommandGroup>
              {apps.map((app) => (
                <CommandItem
                  key={app.id}
                  onSelect={() => {
                    router.push(`/dashboard/applications/${app.id}/users`)
                    setIsOpen(false)
                  }}
                  className="text-sm"
                >
                  <div
                    className="mr-2 aspect-square h-4 w-4 rounded-full"
                    style={getRandomPatternStyle(String(app.id))}
                  />
                  <span className="line-clamp-1">{app.name}</span>
                  <Icons.check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentApp.id === app.id ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
