"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  employees as employeesSchema,
  type Department,
  type Employee,
  type Service,
} from "@/db/schema"
import { Option } from "@/types"
import { SelectValue } from "@radix-ui/react-select"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { catchError } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { deleteEmployeeAction } from "@/app/_actions/employee"

import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select"

interface EmployeeWithService extends Employee {
  serviceName: string
}

interface EmployeesTableProps {
  departments: Pick<Department, "id" | "name">[]
  services: Pick<Service, "id" | "name">[]
  employees: EmployeeWithService[]
  pageCount: number
}

export function EmployeesTable({
  departments,
  services,
  employees,
  pageCount,
}: EmployeesTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([])
  const searchParams = useSearchParams()
  const pathName = usePathname()
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (!value) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  const columns = React.useMemo<ColumnDef<EmployeeWithService, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
              setSelectedRowIds((prev) =>
                prev.length === employees.length
                  ? []
                  : employees.map((row) => row.id)
              )
            }}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value)
              setSelectedRowIds((prev) =>
                value
                  ? [...prev, row.original.id]
                  : prev.filter((id) => id !== row.original.id)
              )
            }}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },

      {
        accessorKey: "cin",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cin" />
        ),
      },
      {
        id: "fullname",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Full name" />
        ),
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
      },
      {
        id: "serviceId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Service" />
        ),
        cell: ({ row }) => row.original.serviceName,
      },
      {
        accessorKey: "gender",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Gender" />
        ),
        cell: ({ row }) =>
          `${row.original
            .gender!.charAt(0)
            .toUpperCase()}${row.original.gender!.slice(1)}`,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/employees/${row.original.id}`}>
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  startTransition(() => {
                    row.toggleSelected(false)

                    toast.promise(
                      deleteEmployeeAction({
                        id: row.original.id,
                        revalidateLink: "/dashboard/employees",
                      }),
                      {
                        loading: "Deleting...",
                        success: () => {
                          router.refresh()
                          return "Employee deleted successfully."
                        },
                        error: (err: unknown) => catchError(err),
                      }
                    )
                  })
                }}
                disabled={isPending}
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [employees, pageCount]
  )
  function deleteSelectedRows() {
    toast.promise(
      Promise.all(
        selectedRowIds.map((id) =>
          deleteEmployeeAction({ id, revalidateLink: "/dashboard/employees" })
        )
      ),
      {
        loading: "Deleting",
        success: () => {
          setSelectedRowIds([])
          router.refresh()
          return "Employee deleted successfully"
        },
        error: (err: unknown) => {
          setSelectedRowIds([])
          return catchError(err)
        },
      }
    )
  }
  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
        <Select
          defaultValue={searchParams.get("departmentId") ?? undefined}
          onValueChange={(value) =>
            router.push(
              `${pathName}?${createQueryString({ departmentId: value })}`
            )
          }
        >
          <SelectTrigger className="sm:max-w-[250px]">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        pageCount={pageCount}
        searchableColumns={[
          {
            id: "cin",
            title: "cin",
          },
        ]}
        filterableColumns={[
          {
            id: "serviceId",
            options: services.map<Option>((service) => ({
              label: service.name,
              value: service.id,
            })),
            title: "Service",
          },
          {
            id: "gender",
            title: "Gender",
            options: employeesSchema.gender.enumValues.map<Option>((item) => ({
              label: `${item.charAt(0).toUpperCase()}${item.slice(1)}`,
              value: item,
            })),
          },
        ]}
        newRowLink={`/dashboard/employees/new`}
        deleteRowsAction={() => void deleteSelectedRows()}
      />
    </div>
  )
}
