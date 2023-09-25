import { db } from "@/db"
import { services as servicesSchema } from "@/db/schema"
import { eq } from "drizzle-orm"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddEmployeeForm } from "@/components/forms/add-emoloyee-form"

interface NewEmployeePageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function NewEmployeePage({
  searchParams,
}: NewEmployeePageProps) {
  const { departmentId } = searchParams ?? {}

  const departments = await db.query.departments.findMany()
  const services = await db.query.services.findMany({
    where:
      typeof departmentId === "string"
        ? eq(servicesSchema.departmentId, departmentId)
        : eq(servicesSchema.departmentId, "1"),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Employee</CardTitle>
        <CardDescription>Add an employee </CardDescription>
      </CardHeader>
      <CardContent>
        <AddEmployeeForm
          redirectLink="/dashboard/employees"
          departments={departments}
          services={services}
        />
      </CardContent>
    </Card>
  )
}
