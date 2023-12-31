"use client"

import * as React from "react"
import type { Profile } from "@/db/schema"
import { ColumnDef } from "@tanstack/react-table"
import { Link, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { catchError, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
import { deleteAppUserAction } from "@/app/_actions/user"

interface AppUsersTableProps {
  data: Profile[]
  appId: string
  pageCount: number
}

export function AppUsersTable({ data, appId, pageCount }: AppUsersTableProps) {
  const [isPending, startTransition] = React.useTransition()
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([])
  const columns = React.useMemo<ColumnDef<Profile, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
              setSelectedRowIds((prev) =>
                prev.length === data.length ? [] : data.map((row) => row.userId)
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
                  ? [...prev, row.original.userId]
                  : prev.filter((id) => id !== row.original.userId)
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
        accessorKey: "username",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Username" />
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ cell }) => (
          <Badge
            className={cn(
              "uppercase",
              cell.getValue() === "admin" ? "bg-destructive" : "bg-primary"
            )}
          >
            {cell.getValue() as string}
          </Badge>
        ),
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
                <Link href={`/dashboard/users/${row.original.userId}`}>
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/product/${row.original.userId}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  startTransition(() => {
                    row.toggleSelected(false)

                    toast.promise(
                      deleteAppUserAction({
                        userId: row.original.userId,
                        appId,
                      }),
                      {
                        loading: "Deleting...",
                        success: () => "User deleted successfully.",
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
    [data, appId, pageCount]
  )
  function deleteSelectedRows() {
    toast.promise(
      Promise.all(
        selectedRowIds.map((id) => deleteAppUserAction({ userId: id, appId }))
      ),
      {
        loading: "Deleting",
        success: () => {
          setSelectedRowIds([])
          return "User deleted successfully"
        },
        error: (err: unknown) => {
          setSelectedRowIds([])
          return catchError(err)
        },
      }
    )
  }
  return (
    <DataTable
      columns={columns}
      data={data}
      pageCount={pageCount}
      searchableColumns={[
        {
          id: "username",
          title: "usernames",
        },
      ]}
      newRowLink={`/dashboard/applications/${appId}/users/new`}
      deleteRowsAction={() => void deleteSelectedRows()}
    />
  )
}
