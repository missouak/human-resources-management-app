import { DataTableLoading } from "@/components/data-table/data-table-loading"

export default function UsersLoading() {
  return <DataTableLoading columnCount={6} isNewRowCreatable isRowsDeletable />
}
