"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { departmentSchema } from "@/lib/validations/department"

export async function addEditDepartmentAction(
  input: z.infer<typeof departmentSchema> & { id?: string }
) {
  const departmentWithSameName = await prisma.department.findFirst({
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

  if (departmentWithSameName) {
    throw new Error("Department name already taken")
  }

  await prisma.department.upsert({
    where: {
      id: input.id,
    },
    create: {
      name: input.name,
    },
    update: {
      name: input.name,
    },
  })
  if (input.id) {
    revalidatePath(`/dashboard/departments/${input.id}`)
  } else {
    revalidatePath("/dashboard/departments")
  }
}

export async function deleteDepartmentAction(id: string) {
  await prisma.department.delete({
    where: {
      id,
    },
  })
  revalidatePath("/dashboard/departments")
}
