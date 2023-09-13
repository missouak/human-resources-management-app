import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddEditServiceForm } from "@/components/forms/add-edit-service-form"

export default function NewServicePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Service</CardTitle>
        <CardDescription>Add a service </CardDescription>
      </CardHeader>
      <CardContent>
        <AddEditServiceForm initialData={null} />
      </CardContent>
    </Card>
  )
}
