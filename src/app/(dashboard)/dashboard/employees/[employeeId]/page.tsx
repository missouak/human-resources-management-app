import { notFound } from "next/navigation"

import { prisma } from "@/lib/db"
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

  const employee = await prisma.employee.findUnique({
    where: {
      id: params.employeeId,
    },
    include: {
      service: {
        include: {
          department: true,
        },
      },
    },
  })

  if (!employee) {
    notFound()
  }

  const departments = await prisma.department.findMany({
    include: {
      services: true,
    },
  })
  const services = await prisma.service.findMany({
    where: {
      departmentId:
        typeof departmentId === "string"
          ? departmentId
          : departments.find(({ services }) =>
              services.some((service) => service.id === employee.id)
            )?.id,
    },
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
