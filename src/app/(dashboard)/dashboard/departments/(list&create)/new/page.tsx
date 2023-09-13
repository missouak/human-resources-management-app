import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddEditDepartmentForm } from "@/components/forms/add-edit-department-form"

export default function AddDepartmentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Department</CardTitle>
        <CardDescription>Add a department </CardDescription>
      </CardHeader>
      <CardContent>
        <AddEditDepartmentForm initialData={null} />
      </CardContent>
    </Card>
  )
}
