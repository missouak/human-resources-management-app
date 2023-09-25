import { db } from "@/db"
import { departments, Employee, employees, services } from "@/db/schema"
import { Gender } from "@/types"
import { and, asc, desc, eq, getTableColumns, like, or, sql } from "drizzle-orm"

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

  const departmentsData = await db
    .select({ id: departments.id, name: departments.name })
    .from(departments)
  const servicesData = await db
    .select({ id: services.id, name: services.name })
    .from(services)
    .where(
      typeof departmentId === "string"
        ? eq(services.departmentId, departmentId)
        : undefined
    )

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

  const { items, count } = await db.transaction(async (tx) => {
    const employeeColumns = getTableColumns(employees)
    const items = await tx
      .select({ ...employeeColumns, serviceName: services.name })
      .from(employees)
      .innerJoin(services, eq(employees.serviceId, services.id))
      .innerJoin(departments, eq(services.departmentId, departments.id))
      .limit(limit)
      .offset(offset)
      .where(
        and(
          or(
            typeof serviceId === "string"
              ? serviceId.includes(".")
                ? or(...serviceId.split(".").map((id) => eq(services.id, id)))
                : eq(services.id, serviceId)
              : typeof departmentId === "string"
              ? eq(departments.id, departmentId)
              : undefined
          ),
          typeof cin === "string" ? like(employees.cin, `%${cin}%`) : undefined,
          typeof gender === "string"
            ? gender.includes(".")
              ? eq(employees.gender, gender.split(".")[0] as Gender)
              : eq(employees.gender, gender as Gender)
            : undefined
        )
      )
      .orderBy(
        column && column in employees
          ? order === "asc"
            ? asc(employees[column])
            : desc(employees[column])
          : asc(employees.id)
      )

    const count = await tx
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .innerJoin(services, eq(employees.serviceId, services.id))
      .innerJoin(departments, eq(services.departmentId, departments.id))
      .where(
        and(
          or(
            typeof serviceId === "string"
              ? serviceId.includes(".")
                ? or(...serviceId.split(".").map((id) => eq(services.id, id)))
                : eq(services.id, serviceId)
              : typeof departmentId === "string"
              ? eq(departments.id, departmentId)
              : undefined
          ),
          typeof cin === "string" ? like(employees.cin, `%${cin}%`) : undefined,
          typeof gender === "string"
            ? gender.includes(".")
              ? eq(employees.gender, gender.split(".")[0] as Gender)
              : eq(employees.gender, gender as Gender)
            : undefined
        )
      )
      .then((res) => res[0]?.count ?? 0)
    return { items, count }
  })

  const pageCount = Math.ceil(count / limit)

  return (
    <EmployeesTable
      departments={departmentsData}
      services={servicesData}
      pageCount={pageCount}
      employees={items}
    />
  )
}
