"use client"

import * as React from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Option } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Action, Profile } from "@prisma/client"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { catchError } from "@/lib/utils"
import { addAppUserSchema } from "@/lib/validations/user"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/mutli-select"
import { addAppUserAction } from "@/app/_actions/user"

import { Icons } from "../icons"
import { Button } from "../ui/button"

interface AddAppUserFormProps {
  users: Pick<Profile, "id" | "username" | "imageUrl">[]
  actions: Pick<Action, "id" | "name">[]
}

type Inputs = z.infer<typeof addAppUserSchema>

export default function AddAppUserForm({
  actions,
  users,
}: AddAppUserFormProps) {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = React.useTransition()
  const [selectedActions, setSelectedActions] = React.useState<Option[] | null>(
    null
  )
  const formatedActions = actions.map<Option>((action) => ({
    label: action.name,
    value: action.id,
  }))
  const form = useForm<Inputs>({
    resolver: zodResolver(addAppUserSchema),
    defaultValues: {
      profileId: users[0]!.id,
      actions: [],
    },
  })

  function onSubmit(data: Inputs) {
    startTransition(async () => {
      try {
        await addAppUserAction(data, params.appId as string)
        form.reset()
        toast.success("User added successfully")
        router.push(`/dashboard/applications/${params.appId}/users`)
        router.refresh()
      } catch (err) {
        catchError(err)
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
        className="grid w-full max-w-xl gap-4"
      >
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <FormField
            control={form.control}
            name="profileId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>User</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <Image
                            src={user.imageUrl}
                            className="h-7 w-7 rounded-full object-cover"
                            alt="Profile"
                            width={100}
                            height={100}
                          />
                          <span>{user.username}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="actions"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Actions</FormLabel>
                <FormControl>
                  <MultiSelect
                    setSelected={setSelectedActions}
                    selected={selectedActions}
                    options={formatedActions}
                    onChange={(values) =>
                      field.onChange(values?.map((o) => ({ id: o.value })))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row">
          <Button size="lg" disabled={isPending}>
            {isPending && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add
            <span className="sr-only">Add</span>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() =>
              router.push(`/dashboard/applications/${params.appId}/users`)
            }
          >
            Cancel
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      </form>
    </Form>
  )
}
