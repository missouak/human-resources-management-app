import { profiles } from "@/db/schema"
import { z } from "zod"

import { authSchema } from "@/lib/validations/auth"

export const userSchema = z
  .object({
    username: authSchema.shape.username,
    password: authSchema.shape.password,
    confirmPassword: authSchema.shape.password,
    role: z.enum(profiles.role.enumValues),
    actions: z
      .array(
        z.object({
          id: z.string(),
        })
      )
      .nullish(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => (data.role !== "admin" && !data.actions ? false : true), {
    message: "Please provide at least one action",
    path: ["actions"],
  })

export const addAppUserSchema = z.object({
  userId: z.string(),
  actions: z.array(
    z.object({
      id: z.string(),
    })
  ),
})
