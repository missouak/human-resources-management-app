import { DataTableLoading } from "@/components/data-table/data-table-loading"

export default function AppUsersLoading() {
  return (
    <DataTableLoading
      columnCount={6}
      isNewRowCreatable={true}
      isRowsDeletable={true}
    />
  )
}
