import { notFound, redirect } from "next/navigation"
import { db } from "@/db"
import {
  actions,
  actionsToProfiles,
  applications,
  Profile,
  profiles,
} from "@/db/schema"
import { and, asc, desc, eq, like, ne, sql } from "drizzle-orm"

import { currentProfile } from "@/lib/auth"
import { AppUsersTable } from "@/components/tables/app-users-table"

interface UsersPageProps {
  params: {
    appId: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function UsersPage({
  params,
  searchParams,
}: UsersPageProps) {
  const profile = await currentProfile()
  if (!profile) redirect("/signin")
  const { page, per_page, sort, username, role } = searchParams ?? {}
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, params.appId),
  })

  if (!app) {
    notFound()
  }

  //Number of items per page
  const limit = typeof per_page === "string" ? parseInt(per_page) : 10
  //Number of items to skip
  const offset =
    typeof page === "string"
      ? parseInt(page) > 0
        ? (parseInt(page) - 1) * limit
        : 0
      : 0
  //Column and order to sort by
  const [column, order] =
    typeof sort === "string"
      ? (sort.split(".") as [
          keyof Pick<Profile, "username"> | undefined,
          "asc" | "desc" | undefined,
        ])
      : []

  const { appUsers, totalUsers } = await db.transaction(async (tx) => {
    const appUsers = await tx
      .select({
        profile: profiles,
      })
      .from(actionsToProfiles)
      .innerJoin(profiles, eq(profiles.userId, actionsToProfiles.profileId))
      .innerJoin(actions, eq(actions.id, actionsToProfiles.actionId))
      .where(
        and(
          eq(actions.applicationId, params.appId),
          ne(profiles.id, profile.id),
          typeof username === "string"
            ? like(profiles.username, `%${username}%`)
            : undefined
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(
        column && column in profiles
          ? order === "asc"
            ? asc(profiles[column])
            : desc(profiles[column])
          : asc(profiles.id)
      )
    // const appUsers = await tx.profile.findMany({
    //   where: {
    //     AND: {
    //       actions: {
    //         some: {
    //           applicationId: params.appId,
    //         },
    //       },
    //       NOT: {
    //         id: profile.id,
    //       },
    //       username: {
    //         contains: typeof username === "string" ? username : undefined,
    //       },
    //     },
    //   },
    //   take: limit,
    //   skip: offset,
    //   orderBy:
    //     order === "asc"
    //       ? column === "username"
    //         ? {
    //             username: order,
    //           }
    //         : { role: order }
    //       : column === "username"
    //       ? { username: order }
    //       : { role: order },
    // })
    const totalUsers = await tx
      .select({
        count: sql<number>`count(*)`,
      })
      .from(actionsToProfiles)
      .innerJoin(profiles, eq(profiles.userId, actionsToProfiles.profileId))
      .innerJoin(actions, eq(actions.id, actionsToProfiles.actionId))
      .where(
        and(
          eq(actions.applicationId, params.appId),
          ne(profiles.id, profile.id),
          typeof username === "string"
            ? like(profiles.username, `%${username}%`)
            : undefined
        )
      )
      .then((res) => res[0]?.count ?? 0)
    return { appUsers, totalUsers }
  })

  const pageCount = Math.ceil(totalUsers / limit)

  return (
    <div className="space-y-2.5">
      <AppUsersTable
        data={appUsers.map((obj) => obj.profile)}
        appId={params.appId}
        pageCount={pageCount}
      />
    </div>
  )
}
