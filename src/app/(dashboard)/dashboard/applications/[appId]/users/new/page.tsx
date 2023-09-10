import { redirect } from "next/navigation"

import { currentProfile } from "@/lib/auth"
import { prisma } from "@/lib/db"
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
  const profiles = await prisma.profile.findMany({
    where: {
      AND: {
        actions: {
          every: {
            NOT: {
              applicationId: params.appId,
            },
          },
        },
        NOT: {
          id: profile.id,
        },
      },
    },
    select: {
      id: true,
      username: true,
      imageUrl: true,
    },
  })
  const actions = await prisma.action.findMany({
    where: {
      application: {
        id: params.appId,
      },
    },
    select: {
      id: true,
      name: true,
      application: {
        select: {
          name: true,
        },
      },
    },
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add User</CardTitle>
        <CardDescription>Add User to the application</CardDescription>
      </CardHeader>
      <CardContent>
        <AddAppUserForm users={profiles} actions={actions} />
      </CardContent>
    </Card>
  )
}
