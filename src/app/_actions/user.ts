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
    await prisma.$transaction(async (tx) => {
      const appActions = await tx.action.findMany({
        where: {
          applicationId: appId,
        },
        select: {
          id: true,
        },
      })
      await tx.profile.update({
        where: {
          userId,
        },
        data: {
          actions: {
            disconnect: appActions,
          },
        },
      })
    })
    revalidatePath(`/dashboard/applications/${appId}/users`)
  } catch (err) {
    return err
  }
}

export async function deleteUserAction({ userId }: { userId: string }) {
  try {
    await clerkClient.users.deleteUser(userId)
    await prisma.profile.delete({ where: { userId } })
    revalidatePath("/dashboard/users")
  } catch (err) {
    return err
  }
}

export async function addUserAction(input: z.infer<typeof userSchema>) {
  const userWithSameUsername = await prisma.profile.findFirst({
    where: {
      username: input.username,
    },
  })

  if (userWithSameUsername) {
    throw new Error(`User with username ${input.username} already exist.`)
  }
  const newUser = await clerkClient.users.createUser({
    username: input.username,
    password: input.password,
    privateMetadata: {
      role: input.role,
    },
  })
  await prisma.profile.create({
    data: {
      userId: newUser.id,
      username: input.username,
      imageUrl: newUser.imageUrl,
      role: input.role,
      actions: {
        connect: input.actions ?? [],
      },
    },
  })
  revalidatePath("/dashboard/users")
}

export async function addAppUserAction(
  input: z.infer<typeof addAppUserSchema>,
  appId: string
) {
  await prisma.profile.update({
    where: {
      id: input.profileId,
    },
    data: {
      actions: {
        connect: input.actions,
      },
    },
  })
  revalidatePath(`/dashboard/application/${appId}/users`)
}
