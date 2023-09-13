import type { Department } from "@prisma/client"

import { prisma } from "@/lib/db"
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

  const { departments, totalDepartments } = await prisma.$transaction(
    async (tx) => {
      const departments = await tx.department.findMany({
        where: {
          name: {
            contains: typeof name === "string" ? name : undefined,
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          name: order,
        },
      })
      const totalDepartments = await tx.department.count({
        where: {
          name: {
            contains: typeof name === "string" ? name : undefined,
          },
        },
      })
      return { departments, totalDepartments }
    }
  )

  const pageCount = Math.ceil(totalDepartments / limit)

  return (
    <div className="space-y-2.5">
      <DepartmentsTable departments={departments} pageCount={pageCount} />
    </div>
  )
}
