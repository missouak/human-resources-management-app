import { Employee, Gender } from "@prisma/client"

import { prisma } from "@/lib/db"
import { EmployeesTable } from "@/components/tables/employees-table"

interface EmployeesPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const { departmentId, serviceId, cin, gender, sort, per_page, page } =
    searchParams ?? {}

  const departments = await prisma.department.findMany()
  const services = await prisma.service.findMany({
    where: {
      departmentId: typeof departmentId === "string" ? departmentId : "1",
    },
  })

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
          keyof Employee | undefined,
          "asc" | "desc" | undefined,
        ])
      : []

  const { employees, totalEmployees } = await prisma.$transaction(
    async (tx) => {
      const employees = await tx.employee.findMany({
        where: {
          AND: {
            cin: {
              contains: typeof cin === "string" ? cin : undefined,
              mode: "insensitive",
            },
            OR: [
              {
                id: typeof serviceId === "string" ? serviceId : undefined,
              },
              {
                service: {
                  departmentId:
                    typeof departmentId === "string" ? departmentId : undefined,
                },
              },
            ],
            gender:
              typeof gender === "string" && gender.includes(".")
                ? (gender.split(".")[0] as Gender)
                : (gender as Gender),
          },
        },
        orderBy: { [column ?? "id"]: order },
        take: limit,
        skip: offset,
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      const totalEmployees = await tx.employee.count({
        where: {
          AND: {
            cin: {
              contains: typeof cin === "string" ? cin : undefined,
            },
            OR: [
              {
                id: typeof serviceId === "string" ? serviceId : undefined,
              },
              {
                service: {
                  departmentId:
                    typeof departmentId === "string" ? departmentId : undefined,
                },
              },
            ],
            gender:
              typeof gender === "string" && gender.includes(".")
                ? (gender.split(".")[0] as Gender)
                : (gender as Gender),
          },
        },
      })

      return { employees, totalEmployees }
    }
  )

  const pageCount = Math.ceil(totalEmployees / limit)

  return (
    <EmployeesTable
      departments={departments}
      services={services}
      pageCount={pageCount}
      employees={employees}
    />
  )
}
