import { z } from "zod"

export const departmentSchema = z.object({
  name: z.string().nonempty({ message: "Please provide a name" }),
})
