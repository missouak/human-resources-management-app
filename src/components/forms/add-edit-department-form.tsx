"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { type Department } from "@prisma/client"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { catchError } from "@/lib/utils"
import { departmentSchema } from "@/lib/validations/department"
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
  addEditDepartmentAction,
  deleteDepartmentAction,
} from "@/app/_actions/department"

interface AddEditDepartmentFormProps {
  initialData: Pick<Department, "id" | "name"> | null
}

type Inputs = z.infer<typeof departmentSchema>

export function AddEditDepartmentForm({
  initialData,
}: AddEditDepartmentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const form = useForm<Inputs>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: initialData ? initialData.name : "",
    },
  })
  const action = initialData ? "Update department" : "Add department"
  const message = initialData
    ? "Department updated successfully"
    : "Department added successfully"

  function onSubmit(data: Inputs) {
    startTransition(async () => {
      try {
        await addEditDepartmentAction({
          ...data,
          id: initialData ? initialData.id : "",
        })
        form.reset()
        toast.success(message)
        if (!initialData) {
          router.push("/dashboard/departments")
          router.refresh()
        }
      } catch (err) {
        catchError(err)
      }
    })
  }

  function deleteDepartment(id: string) {
    startTransition(async () => {
      try {
        await deleteDepartmentAction(id)
        router.push("/dashboard/departments")
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
              <Input placeholder="Department 1" {...field} />
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
              onConfirm={() => deleteDepartment(initialData.id)}
              variant="destructive"
            >
              Delete department
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
