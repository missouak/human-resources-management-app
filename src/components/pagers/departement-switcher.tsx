"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { Department } from "@/db/schema"

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

interface DepartmentSwitcherProps
  extends React.ComponentPropsWithoutRef<typeof PopoverTrigger> {
  currentDepartment: Pick<Department, "id" | "name">
  departments: Pick<Department, "id" | "name">[]
  dashboardRedirectPath: string
}

export function DepartmentSwitcher({
  currentDepartment,
  departments,
  dashboardRedirectPath,
  className,
  ...props
}: DepartmentSwitcherProps) {
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
            style={getRandomPatternStyle(String(currentDepartment.id))}
          />
          <span className="truncate">{currentDepartment.name}</span>
          <Icons.chevronUpDown
            className="ml-auto h-4 w-4 shrink-0 opacity-50"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] p-0 sm:w-[180px]">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search department..." />
            <CommandEmpty>No department found.</CommandEmpty>
            <CommandGroup>
              {departments.map((department) => (
                <CommandItem
                  key={department.id}
                  onSelect={() => {
                    router.push(`/dashboard/departments/${department.id}`)
                    setIsOpen(false)
                  }}
                  className="text-sm"
                >
                  <div
                    className="mr-2 aspect-square h-4 w-4 rounded-full"
                    style={getRandomPatternStyle(String(department.id))}
                  />
                  <span className="line-clamp-1">{department.name}</span>
                  <Icons.check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentDepartment.id === department.id
                        ? "opacity-100"
                        : "opacity-0"
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
