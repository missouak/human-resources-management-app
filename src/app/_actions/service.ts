"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { serviceSchema } from "@/lib/validations/service"

export async function addEditServiceAction(
  input: z.infer<typeof serviceSchema> & { id?: string; departmentId: string }
) {
  const serviceWithSameName = await prisma.service.findFirst({
    where: {
      AND: {
        name: input.name,
        NOT: {
          id: input.id,
        },
      },
    },
    select: {
      id: true,
    },
  })

  if (serviceWithSameName) {
    throw new Error("Service name already taken")
  }
  await prisma.service.upsert({
    where: {
      id: input.id ?? "",
    },
    create: {
      name: input.name,
      departmentId: input.departmentId,
    },
    update: {
      name: input.name,
    },
  })
  if (input.id) {
    revalidatePath(
      `/dashboard/departments/${input.departmentId}/services/${input.id}`
    )
  } else {
    revalidatePath(`/dashboard/departments/${input.departmentId}/services`)
  }
}

export async function deleteServiceAction({
  id,
  departmentId,
}: {
  id: string
  departmentId: string
}) {
  await prisma.service.delete({
    where: {
      id,
    },
  })
  revalidatePath(`/dashboard/departments/${departmentId}/services`)
}
