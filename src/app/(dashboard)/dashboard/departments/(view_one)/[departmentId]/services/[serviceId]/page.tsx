import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { services } from "@/db/schema"
import { and, eq } from "drizzle-orm"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddEditServiceForm } from "@/components/forms/add-edit-service-form"
import { Icons } from "@/components/icons"

interface UpdateServicePageProps {
  params: {
    departmentId: string
    serviceId: string
  }
}

export default async function UpdateServicePage({
  params,
}: UpdateServicePageProps) {
  const service = await db.query.services.findFirst({
    where: and(
      eq(services.id, params.serviceId),
      eq(services.departmentId, params.departmentId)
    ),
  })
  if (!service) {
    notFound()
  }
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between space-x-2 pr-6">
          <CardTitle className="text-2xl">Update service</CardTitle>
          <Link
            href={`/dashboard/departments/${service.departmentId}/services`}
            className="group flex items-center text-sm font-semibold"
          >
            <Icons.chevronLeft className="mr-0.5 h-4 w-4" />
            Back
          </Link>
        </div>
        <CardDescription>
          Update service information, or delete it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AddEditServiceForm initialData={service} />
      </CardContent>
    </Card>
  )
}
