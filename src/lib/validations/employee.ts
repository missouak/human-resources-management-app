import { Gender, MarialStatus } from "@prisma/client"
import { z } from "zod"

export const employeeSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  cin: z.string(),
  gender: z.nativeEnum(Gender),
  phoneNumber: z.string().regex(/^((06|07)[0-9]{8})$/),
  email: z.string().email(),
  address: z.string(),
  birthday: z.date(),
  maritalStatus: z.nativeEnum(MarialStatus),
  image: z
    .unknown()
    .refine((val) => {
      if (!Array.isArray(val)) return false
      if (val.some((file) => !(file instanceof File))) return false
      return true
    }, "Must be an array of File")
    .optional()
    .nullable()
    .default(null),
  iban: z.string(),
  rib: z.string(),
  joinedAt: z.date(),
  jobTitle: z.string(),
  serviceId: z.string(),
})

export const getEmployeeSchema = z.object({
  id: z.string(),
})
