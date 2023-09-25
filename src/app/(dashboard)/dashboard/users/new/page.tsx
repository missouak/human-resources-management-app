import { db } from "@/db"
import { actions } from "@/db/schema"
import { asc } from "drizzle-orm"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddUserForm } from "@/components/forms/add-user-form"

export default async function AddUserPage() {
  const items = await db.query.actions.findMany({
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
    orderBy: [asc(actions.applicationId)],
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add User</CardTitle>
        <CardDescription>Add User to the application</CardDescription>
      </CardHeader>
      <CardContent>
        <AddUserForm actions={items} />
      </CardContent>
    </Card>
  )
}
