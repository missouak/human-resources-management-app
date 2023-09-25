import { db } from "@/db"
import { departments, type Department } from "@/db/schema"
import { asc, desc, like, sql } from "drizzle-orm"

import { DepartmentsTable } from "@/components/tables/departments-table"

interface DepartmentsPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function DepartmentsPage({
  searchParams,
}: DepartmentsPageProps) {
  const { page, per_page, sort, name } = searchParams ?? {}

  //Number of items per page
  const limit = typeof per_page === "string" ? parseInt(per_page) : 10
  //Number of items to skip
  const offset =
    typeof page === "string"
      ? parseInt(page) > 0
        ? (parseInt(page) - 1) * limit
        : 0
      : 0
  //Column and order to sort by
  const [column, order] =
    typeof sort === "string"
      ? (sort.split(".") as [
          keyof Pick<Department, "name"> | undefined,
          "asc" | "desc" | undefined,
        ])
      : []

  const { items, count } = await db.transaction(async (tx) => {
    const items = await tx
      .select()
      .from(departments)
      .where(
        typeof name === "string"
          ? like(departments.name, `%${name}%`)
          : undefined
      )
      .limit(limit)
      .offset(offset)
      .orderBy(
        column && column in departments
          ? order === "asc"
            ? asc(departments[column])
            : desc(departments[column])
          : asc(departments.id)
      )
    const count = await tx
      .select({ count: sql<number>`count(*)` })
      .from(departments)
      .where(
        typeof name === "string"
          ? like(departments.name, `%${name}%`)
          : undefined
      )
      .then((res) => res[0]?.count ?? 0)
    return { items, count }
  })

  const pageCount = Math.ceil(count / limit)

  return (
    <div className="space-y-2.5">
      <DepartmentsTable departments={items} pageCount={pageCount} />
    </div>
  )
}
