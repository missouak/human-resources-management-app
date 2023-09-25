"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { actions, actionsToProfiles, profiles } from "@/db/schema"
import { clerkClient } from "@clerk/nextjs"
import { and, eq, inArray, ne } from "drizzle-orm"
import { z } from "zod"

import { addAppUserSchema, userSchema } from "@/lib/validations/user"

export async function deleteAppUserAction({
  userId,
  appId,
}: {
  userId: string
  appId: string
}) {
  try {
    // const userActionsIds = db
    //   .$with("userActionsIds")
    //   .as(
    //     db
    //       .select({ id: actionsToProfiles.actionId })
    //       .from(actionsToProfiles)
    //       .where(eq(actionsToProfiles.profileId, userId))
    //   )
    // const userActions = await db.query.actions.findMany({
    //   where: and(
    //     ne(actions.applicationId, appId),
    //     inArray(
    //       actions.id,
    //       db
    //         .with(userActionsIds)
    //         .select({ id: userActionsIds.id })
    //         .from(userActionsIds)
    //     )
    //   ),
    //   columns: {
    //     id: true,
    //   },
    // })
    const userActions = await db
      .select({ id: actionsToProfiles.actionId })
      .from(actionsToProfiles)
      .innerJoin(actions, eq(actionsToProfiles.actionId, actions.id))
      .where(
        and(
          eq(actionsToProfiles.profileId, userId),
          eq(actions.applicationId, appId)
        )
      )
    //
    await db.delete(actionsToProfiles).where(
      inArray(
        actionsToProfiles.actionId,
        userActions
          .map((action) => action.id ?? "")
          .filter((value) => value !== "")
      )
    )
    revalidatePath(`/dashboard/applications/${appId}/users`)
  } catch (err) {
    throw err
  }
}

export async function deleteUserAction({ userId }: { userId: string }) {
  try {
    await clerkClient.users.deleteUser(userId)
    revalidatePath("/dashboard/users")
  } catch (err) {
    throw err
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
  await db.insert(actionsToProfiles).values(
    input.actions.map((action) => ({
      profileId: input.userId,
      actionId: action.id,
    }))
  )
  revalidatePath(`/dashboard/application/${appId}/users`)
}
