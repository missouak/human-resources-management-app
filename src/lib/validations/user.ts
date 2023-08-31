import { z } from "zod"

import { authSchema } from "@/lib/validations/auth"

export const userSchema = z
  .object({
    username: authSchema.shape.username,
    password: authSchema.shape.password,
    confirmPassword: authSchema.shape.password,
    role: z.enum(["user", "admin", "superAdmin"]),
    actions: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    ),
    // .nonempty(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
