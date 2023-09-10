import { redirect } from "next/navigation"

import { currentProfile } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { UsersTable } from "@/components/tables/users-table"

export default async function UsersPage() {
  const profile = await currentProfile()
  if (!profile) redirect("/signIn")

  const users = await prisma.profile.findMany({
    where: {
      NOT: {
        id: profile.id,
      },
    },
  })
  return <UsersTable data={users} pageCount={1} />
}
