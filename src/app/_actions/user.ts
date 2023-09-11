"use server"

import { revalidatePath } from "next/cache"
import { clerkClient } from "@clerk/nextjs"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { addAppUserSchema, userSchema } from "@/lib/validations/user"

export async function deleteAppUserAction({
  userId,
  appId,
}: {
  userId: string
  appId: string
}) {
  try {
    const userActions = await prisma.action.findMany({
      where: {
        AND: {
          users: {
            some: {
              userId,
            },
          },
          NOT: {
            applicationId: appId,
          },
        },
      },
      select: {
        id: true,
      },
    })
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        actions: userActions,
      },
    })
    revalidatePath(`/dashboard/applications/${appId}/users`)
  } catch (err) {
    return err
  }
}

export async function deleteUserAction({ userId }: { userId: string }) {
  try {
    await clerkClient.users.deleteUser(userId)
    revalidatePath("/dashboard/users")
  } catch (err) {
    return err
  }
}

export async function addUserAction(input: z.infer<typeof userSchema>) {
  await clerkClient.users.createUser({
    username: input.username,
    password: input.password,
    privateMetadata: {
      role: input.role,
      actions: input.actions,
    },
  })

  revalidatePath("/dashboard/users")
}

export async function addAppUserAction(
  input: z.infer<typeof addAppUserSchema>,
  appId: string
) {
  const userActions = await prisma.action.findMany({
    where: {
      users: {
        some: {
          userId: input.userId,
        },
      },
    },
    select: {
      id: true,
    },
  })
  await clerkClient.users.updateUserMetadata(input.userId, {
    privateMetadata: {
      actions: [...userActions, ...input.actions],
    },
  })
  revalidatePath(`/dashboard/application/${appId}/users`)
}
