import { redirect } from "next/navigation"
import { db } from "@/db"
import {
  actions as actionsSchema,
  actionsToProfiles,
  Profile,
  profiles,
} from "@/db/schema"
import { and, eq, exists, ne, notExists, notInArray, or } from "drizzle-orm"

import { currentProfile } from "@/lib/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import AddAppUserForm from "@/components/forms/add-app-user-form"

interface NewUserPageProps {
  params: {
    appId: string
  }
}

export default async function NewUserPage({ params }: NewUserPageProps) {
  const profile = await currentProfile()
  if (!profile) {
    redirect("/signin")
  }

  const actions = await db.query.actions.findMany({
    where: eq(actionsSchema.applicationId, params.appId),
    columns: {
      id: true,
      name: true,
    },
    with: {
      application: {
        columns: {
          name: true,
        },
      },
    },
  })

  const items = await db.query.actionsToProfiles.findMany({
    where: and(
      ne(actionsToProfiles.profileId, profile.userId),
      notInArray(
        actionsToProfiles.actionId,
        actions.map((actions) => actions.id)
      )
    ),
    columns: {
      actionId: false,
      profileId: false,
    },
    with: {
      profile: {
        columns: {
          userId: true,
          username: true,
          imageUrl: true,
        },
      },
    },
  })

  // const items = await db
  //   .select({
  //     userId: profiles.userId,
  //     username: profiles.username,
  //     imageUrl: profiles.imageUrl,
  //   })
  //   .from(actionsToProfiles)
  //   .leftJoin(profiles, eq(actionsToProfiles.profileId, profile.userId))
  //   .where(
  //     and(
  //       ne(actionsToProfiles.profileId, profile.userId),
  //       notInArray(
  //         actionsToProfiles.actionId,
  //         actions.map((actions) => actions.id)
  //       )
  //     )
  //   )

  console.log(items.filter((item) => item.profile !== null))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add User</CardTitle>
        <CardDescription>Add User to the application</CardDescription>
      </CardHeader>
      <CardContent>
        <AddAppUserForm
          users={
            items
              .filter((item) => item.profile !== null)
              .map((item) => item.profile) as Pick<
              Profile,
              "username" | "userId" | "imageUrl"
            >[]
          }
          actions={actions}
        />
      </CardContent>
    </Card>
  )
}
