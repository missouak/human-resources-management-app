"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { employees } from "@/db/schema"
import { StoredFile } from "@/types"
import { and, eq, ne } from "drizzle-orm"
import { z } from "zod"

import { employeeSchema, getEmployeeSchema } from "@/lib/validations/employee"

export async function addEmployeeAction(
  input: z.infer<typeof employeeSchema> & {
    image: StoredFile[] | null
    revalidateLink: string
  }
) {
  const existedEmployee = await db.query.employees.findFirst({
    where: eq(employees.cin, input.cin),
    columns: {
      id: true,
    },
  })

  if (existedEmployee) {
    throw new Error("Employee already exists")
  }

  await db.insert(employees).values({ ...input, image: input.image })
  revalidatePath(input.revalidateLink)
}

export async function updateEmoloyeeAction(
  input: z.infer<typeof employeeSchema> & {
    id: string
    image: StoredFile[] | null
    revalidateLink: string
  }
) {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, input.id),
  })

  if (!employee) {
    throw new Error("Employee not found")
  }

  await db.update(employees).set(input)
  revalidatePath(input.revalidateLink)
}

export async function checkEmployeeAction(input: { id?: string; cin: string }) {
  const employee = await db.query.employees.findFirst({
    where: input.id
      ? and(eq(employees.cin, input.cin), ne(employees.id, input.id))
      : eq(employees.cin, input.cin),
    columns: {
      id: true,
    },
  })

  if (employee) {
    throw new Error(`Employee with cin ${input.cin} already exists`)
  }
}

export async function deleteEmployeeAction(
  input: z.infer<typeof getEmployeeSchema> & { revalidateLink: string }
) {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, input.id),
    columns: {
      id: true,
    },
  })

  if (!employee) {
    throw new Error("Employee not found")
  }

  await db.delete(employees).where(eq(employees.id, input.id))
  revalidatePath(input.revalidateLink)
}
