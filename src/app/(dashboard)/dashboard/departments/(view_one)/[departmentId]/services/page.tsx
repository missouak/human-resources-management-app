import { db } from "@/db"
import { Service, services } from "@/db/schema"
import { and, asc, desc, eq, like, sql } from "drizzle-orm"

import { ServicesTable } from "@/components/tables/services-table"

interface ServicesPageProps {
  params: {
    departmentId: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function ServicesPage({
  params,
  searchParams,
}: ServicesPageProps) {
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
          keyof Pick<Service, "name"> | undefined,
          "asc" | "desc" | undefined,
        ])
      : []

  const { items, count } = await db.transaction(async (tx) => {
    const items = await tx
      .select()
      .from(services)
      .where(
        and(
          eq(services.departmentId, params.departmentId),
          typeof name === "string"
            ? like(services.name, `%${name}%`)
            : undefined
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(
        column && column in services
          ? order === "asc"
            ? asc(services[column])
            : desc(services[column])
          : asc(services.id)
      )
    const count = await tx
      .select({ count: sql<number>`count(*)` })
      .from(services)
      .where(
        and(
          eq(services.departmentId, params.departmentId),
          typeof name === "string"
            ? like(services.name, `%${name}%`)
            : undefined
        )
      )
      .then((res) => res[0]?.count ?? 0)
    return { items, count }
  })

  const pageCount = Math.ceil(count / limit)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Services</h2>
      <ServicesTable pageCount={pageCount} services={items} />
    </div>
  )
}
