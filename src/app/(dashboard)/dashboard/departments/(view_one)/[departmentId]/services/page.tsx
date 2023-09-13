import { Service } from "@prisma/client"

import { prisma } from "@/lib/db"
import { ServicesTable } from "@/components/tables/services-table"

interface ServicesPageProps {
  params: {
    departmentId: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function ServicesPage({
  params,
  searchParams,
}: ServicesPageProps) {
  const { page, per_page, sort, name } = searchParams ?? {}

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
          keyof Pick<Service, "name"> | undefined,
          "asc" | "desc" | undefined,
        ])
      : []

  const { services, totalServices } = await prisma.$transaction(async (tx) => {
    const services = await tx.service.findMany({
      where: {
        AND: {
          name: {
            contains: typeof name === "string" ? name : undefined,
          },
          departmentId: params.departmentId,
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        name: order,
      },
    })
    const totalServices = await tx.service.count({
      where: {
        AND: {
          name: {
            contains: typeof name === "string" ? name : undefined,
          },
          departmentId: params.departmentId,
        },
      },
    })
    return { services, totalServices }
  })

  const pageCount = Math.ceil(totalServices / limit)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Services</h2>
      <ServicesTable pageCount={pageCount} services={services} />
    </div>
  )
}
