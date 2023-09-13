import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { env } from "@/env.mjs"

import { prisma } from "@/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddEditDepartmentForm } from "@/components/forms/add-edit-department-form"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Manage department",
  description: "Manage your department",
}

interface UpdateDepartmentPageProps {
  params: {
    departmentId: string
  }
}

export default async function UpdateDepartmentPage({
  params,
}: UpdateDepartmentPageProps) {
  const departmentId = params.departmentId

  const department = await prisma.department.findFirst({
    where: { id: departmentId },
    select: {
      id: true,
      name: true,
    },
  })

  if (!department) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Card
        as="section"
        id="update-department"
        aria-labelledby="update-department-heading"
      >
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Update department</CardTitle>
          <CardDescription>
            Update department informations or delete it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddEditDepartmentForm initialData={department} />
        </CardContent>
      </Card>
    </div>
  )
}
