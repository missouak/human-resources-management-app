import { notFound } from "next/navigation"
import { type User } from "@clerk/nextjs/server"

import { prisma } from "@/lib/db"
import { UsersTable } from "@/components/tables/users-table"

interface UsersPageProps {
  params: {
    slug: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function UsersPage({
  params,
  searchParams,
}: UsersPageProps) {
  const { page, per_page, sort, username, role } = searchParams ?? {}
  const app = await prisma.application.findFirst({
    where: {
      slug: params.slug,
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
          keyof Pick<User, "username"> | undefined,
          "asc" | "desc" | undefined,
        ])
      : []

  const { appUsers, totalUsers } = await prisma.$transaction(async (tx) => {
    const appUsers = await tx.user.findMany({
      where: {
        AND: {
          actions: {
            some: {
              application: {
                slug: params.slug,
              },
            },
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
    const totalUsers = await tx.user.count({
      where: {
        AND: {
          actions: {
            some: {
              application: {
                slug: params.slug,
              },
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
      <UsersTable data={appUsers} slug={params.slug} pageCount={pageCount} />
    </div>
  )
}
