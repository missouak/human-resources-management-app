import { prisma } from "@/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddUserForm } from "@/components/forms/add-user-form"

export default async function AddUserPage() {
  const actions = await prisma.action.findMany({
    select: {
      id: true,
      name: true,
      application: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      application: {
        name: "asc",
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
        <AddUserForm actions={actions} />
      </CardContent>
    </Card>
  )
}
