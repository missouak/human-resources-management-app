"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { type Service } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { catchError } from "@/lib/utils"
import { serviceSchema } from "@/lib/validations/service"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Icons } from "@/components/icons"
import {
  addServiceAction,
  deleteServiceAction,
  editServiceAction,
} from "@/app/_actions/service"

interface AddDepartmentFormProps {
  initialData: Pick<Service, "id" | "name"> | null
}

type Inputs = z.infer<typeof serviceSchema>

export function AddEditServiceForm({ initialData }: AddDepartmentFormProps) {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = React.useTransition()
  const form = useForm<Inputs>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData ? initialData.name : "",
    },
  })
  const action = initialData ? "Update service" : "Add service"
  const message = initialData
    ? "Service updated successfully"
    : "Service added successfully"

  function onSubmit(data: Inputs) {
    startTransition(async () => {
      try {
        initialData
          ? await editServiceAction({
              ...data,
              id: initialData.id,
              departmentId: params.departmentId as string,
            })
          : await addServiceAction({
              ...data,
              departmentId: params.departmentId as string,
            })
        form.reset()
        toast.success(message)
        if (!initialData) {
          router.push(`/dashboard/departments/${params.departmentId}/services`)
          router.refresh()
        }
      } catch (err) {
        catchError(err)
      }
    })
  }

  function deleteService(id: string) {
    startTransition(async () => {
      try {
        await deleteServiceAction({
          id,
          departmentId: params.departmentId as string,
        })
        router.push(`/dashboard/departments/${params.departmentId}/services`)
        router.refresh()
      } catch (err) {
        catchError(err)
      }
    })
  }

  return (
    <Form {...form}>
      <form
        className="grid w-full max-w-xl gap-5"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input placeholder="Service 1" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col justify-start gap-4 sm:flex-row">
          <Button disabled={isPending} type="submit">
            {isPending && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {action}
            <span className="sr-only">{action}</span>
          </Button>
          {initialData ? (
            <ConfirmDialog
              disabled={isPending}
              onConfirm={() => deleteService(initialData.id)}
              variant="destructive"
            >
              Delete service
            </ConfirmDialog>
          ) : (
            <Button
              disabled={isPending}
              variant="secondary"
              onClick={() => router.push("/dashboard/departments")}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
