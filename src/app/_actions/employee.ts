"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { employeeSchema, getEmployeeSchema } from "@/lib/validations/employee"

export async function addEmployeeAction(
  input: z.infer<typeof employeeSchema> & {
    imageUrl: string | null
  }
) {
  const existedEmployee = await prisma.employee.findFirst({
    where: {
      cin: input.cin,
    },
  })

  if (existedEmployee) {
    throw new Error("Employee already exists")
  }

  await prisma.employee.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      cin: input.cin,
      email: input.email,
      phoneNumber: input.phoneNumber,
      birthday: input.birthday,
      gender: input.gender,
      maritalStatus: input.maritalStatus,
      address: input.address,
      imageUrl: input.imageUrl,
      jobTitle: input.jobTitle,
      joinedAt: input.joinedAt,
      rib: input.rib,
      iban: input.iban,
      serviceId: input.serviceId,
    },
  })

  revalidatePath("/dashboard/employees")
}

export async function updateEmoloyeeAction(
  input: z.infer<typeof employeeSchema> & {
    id: string
    imageUrl: string | null
    revalidateLink: string
  }
) {
  const employee = await prisma.employee.findFirst({
    where: {
      id: input.id,
    },
    select: {
      id: true,
    },
  })

  if (!employee) {
    throw new Error("Employee not found")
  }

  await prisma.employee.update({
    where: { id: input.id },
    data: { ...input },
  })
  revalidatePath(input.revalidateLink)
}

export async function checkEmplyeeAction(input: { cin: string }) {
  const employee = await prisma.employee.findFirst({
    where: {
      cin: input.cin,
    },
    select: {
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
  const employee = await prisma.employee.findFirst({
    where: {
      id: input.id,
    },
    select: {
      id: true,
    },
  })

  if (!employee) {
    throw new Error("Employee not found")
  }

  await prisma.employee.delete({
    where: {
      id: input.id,
    },
  })
  revalidatePath(input.revalidateLink)
}
