"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { departments, services } from "@/db/schema"
import { and, eq, ne } from "drizzle-orm"
import { z } from "zod"

import { serviceSchema } from "@/lib/validations/service"

export async function addServiceAction(
  input: z.infer<typeof serviceSchema> & { departmentId: string }
) {
  const serviceWithSameName = await db.query.services.findFirst({
    where: and(
      eq(services.name, input.name),
      eq(services.departmentId, input.departmentId)
    ),
    columns: {
      id: true,
    },
  })
  if (serviceWithSameName) {
    throw new Error("Service name already taken")
  }
  await db
    .insert(services)
    .values({ name: input.name, departmentId: input.departmentId })
  revalidatePath(`/dashboard/departments/${input.departmentId}/services`)
}

export async function editServiceAction(
  input: z.infer<typeof serviceSchema> & {
    departmentId: string
    id: string
  }
) {
  const serviceWithSameName = await db.query.services.findFirst({
    where: and(
      eq(services.name, input.name),
      eq(services.departmentId, input.departmentId),
      ne(services.id, input.id)
    ),
    columns: {
      id: true,
    },
  })
  if (serviceWithSameName) {
    throw new Error("Service name already taken")
  }
  await db.update(services).set(input).where(eq(services.id, input.id))
  revalidatePath(
    `/dashboard/departments/${input.departmentId}/services/${input.id}`
  )
}

export async function deleteServiceAction({
  id,
  departmentId,
}: {
  id: string
  departmentId: string
}) {
  const service = await db.query.services.findFirst({
    where: eq(services.id, id),
    columns: {
      id: true,
    },
  })

  if (!service) throw new Error("Service not found")

  await db.delete(services).where(eq(services.id, id))
  revalidatePath(`/dashboard/departments/${departmentId}/services`)
}
