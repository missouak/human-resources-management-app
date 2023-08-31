import { prisma } from "@/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddUserForm } from "@/components/forms/add-user-form"
import { Shell } from "@/components/shells/shell"

interface NewUserPageProps {
  params: {
    slug: string
  }
}

export default async function NewUserPage({ params }: NewUserPageProps) {
  const actions = await prisma.action.findMany({
    where: {
      application: {
        slug: params.slug,
      },
    },
    select: {
      id: true,
      name: true,
    },
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add User</CardTitle>
        <CardDescription>Add User to the application</CardDescription>
      </CardHeader>
      <CardContent>
        <AddUserForm actions={actions} />
      </CardContent>
    </Card>
  )
}
