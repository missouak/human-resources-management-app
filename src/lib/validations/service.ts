import { z } from "zod"

import { departmentSchema } from "./department"

export const serviceSchema = z.object({
  name: departmentSchema.shape.name,
})
