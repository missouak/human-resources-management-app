import { notFound } from "next/navigation"
import { db } from "@/db"
import { employees, services as servicesSchema } from "@/db/schema"
import { eq } from "drizzle-orm"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EditEmployeeForm } from "@/components/forms/edit-employee-form"

interface EditEmployeePageProps {
  params: {
    employeeId: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function EditEmployeePage({
  params,
  searchParams,
}: EditEmployeePageProps) {
  const { departmentId } = searchParams ?? {}

  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, params.employeeId),
    with: {
      service: {
        with: {
          department: true,
        },
      },
    },
  })
  if (!employee) {
    notFound()
  }

  const departments = await db.query.departments.findMany({
    with: {
      services: true,
    },
  })
  const services = await db.query.services.findMany({
    where: eq(
      servicesSchema.departmentId,
      typeof departmentId === "string"
        ? departmentId
        : departments.find(({ services }) =>
            services.some((service) => service.id === employee.serviceId)
          )?.id ?? "1"
    ),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Employee</CardTitle>
        <CardDescription>Edit an employee </CardDescription>
      </CardHeader>
      <CardContent>
        <EditEmployeeForm
          redirectLink="/dashboard/employees"
          employee={employee}
          departments={departments}
          services={services}
        />
      </CardContent>
    </Card>
  )
}
