import { redirect } from "next/navigation"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { ne } from "drizzle-orm"

import { currentProfile } from "@/lib/auth"
import { UsersTable } from "@/components/tables/users-table"

export default async function UsersPage() {
  const profile = await currentProfile()
  if (!profile) redirect("/signIn")

  const users = await db.query.profiles.findMany({
    where: ne(profiles.id, profile.id),
  })
  return <UsersTable data={users} pageCount={1} />
}
