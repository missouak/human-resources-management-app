import { z } from "zod"

export const authSchema = z.object({
  username: z.string().min(5, {
    message: "Username must be at least 5 characters long",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/, {
      message:
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
    }),
})

export const userPrivateMetadataSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("admin"),
    actions: z.undefined(),
  }),
  z.object({
    role: z.literal("user"),
    actions: z.array(
      z.object({
        id: z.string(),
      })
    ),
  }),
])
