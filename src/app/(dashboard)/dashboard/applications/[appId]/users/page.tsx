import { notFound, redirect } from "next/navigation"
import type { Profile } from "@prisma/client"

import { currentProfile } from "@/lib/auth"
import { prisma } from "@/lib/db"
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
  const app = await prisma.application.findUnique({
    where: {
      id: params.appId,
    },
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

  const { appUsers, totalUsers } = await prisma.$transaction(async (tx) => {
    const appUsers = await tx.profile.findMany({
      where: {
        AND: {
          actions: {
            some: {
              applicationId: params.appId,
            },
          },
          NOT: {
            id: profile.id,
          },
          username: {
            contains: typeof username === "string" ? username : undefined,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy:
        order === "asc"
          ? column === "username"
            ? {
                username: order,
              }
            : { role: order }
          : column === "username"
          ? { username: order }
          : { role: order },
    })
    const totalUsers = await tx.profile.count({
      where: {
        AND: {
          actions: {
            some: {
              applicationId: params.appId,
            },
          },
          username: {
            contains: typeof username === "string" ? username : undefined,
          },
        },
      },
    })
    return { appUsers, totalUsers }
  })

  const pageCount = Math.ceil(totalUsers / limit)

  return (
    <div className="space-y-2.5">
      <AppUsersTable
        data={appUsers}
        appId={params.appId}
        pageCount={pageCount}
      />
    </div>
  )
}
