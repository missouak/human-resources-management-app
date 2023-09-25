"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { departments } from "@/db/schema"
import { and, eq, ne } from "drizzle-orm"
import { z } from "zod"

import { departmentSchema } from "@/lib/validations/department"

export async function addDepartmentAction(
  input: z.infer<typeof departmentSchema>
) {
  const departmentWithSameName = await db.query.departments.findFirst({
    where: eq(departments.name, input.name),
    columns: {
      id: true,
    },
  })
  if (departmentWithSameName) {
    throw new Error("Department name already taken")
  }

  await db.insert(departments).values({ name: input.name })

  revalidatePath("/dashboard/departments")
}

export async function editDepartmentAction(
  input: z.infer<typeof departmentSchema> & {
    id: string
  }
) {
  const departmentWithSameName = await db.query.departments.findFirst({
    where: and(eq(departments.name, input.name), ne(departments.id, input.id)),
    columns: {
      id: true,
    },
  })
  if (departmentWithSameName) {
    throw new Error("Department name already taken")
  }

  await db.update(departments).set(input).where(eq(departments.id, input.id))
  revalidatePath(`/dashboard/departments/${input.id}`)
}

export async function deleteDepartmentAction(id: string) {
  await db.delete(departments).where(eq(departments.id, id))
  revalidatePath("/dashboard/departments")
}
