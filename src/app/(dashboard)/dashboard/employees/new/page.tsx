import { prisma } from "@/lib/db"
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

  const departments = await prisma.department.findMany()
  const services = await prisma.service.findMany({
    where: {
      departmentId: typeof departmentId === "string" ? departmentId : "1",
    },
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
