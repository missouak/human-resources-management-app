import { db } from "@/db"
import { profiles } from "@/db/schema"
import { auth } from "@clerk/nextjs"
import { eq } from "drizzle-orm"

export async function currentProfile() {
  const { userId } = auth()

  if (!userId) return null

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  })

  return profile
}
