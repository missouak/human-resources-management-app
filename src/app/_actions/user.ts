"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db"

export async function deleteUserAction({
  id,
  appSlug,
}: {
  id: string
  appSlug: string
}) {
  try {
    await prisma.$transaction(async (tx) => {
      const appActions = await tx.action.findMany({
        where: {
          application: {
            slug: appSlug,
          },
        },
        select: { id: true },
      })
      await tx.user.update({
        where: {
          id,
        },
        data: {
          actions: {
            disconnect: appActions,
          },
        },
      })
    })
    revalidatePath(`/dashboard/${appSlug}/users`)
  } catch (err) {
    return err
  }
}
