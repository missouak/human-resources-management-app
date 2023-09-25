"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { profiles, type Action, type Application } from "@/db/schema"
import { Option } from "@/types"
import { isClerkAPIResponseError } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { catchClerkError, catchError, cn } from "@/lib/utils"
import { userSchema } from "@/lib/validations/user"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { MultiSelect } from "@/components/mutli-select"
import { PasswordInput } from "@/components/password-input"
import { addUserAction } from "@/app/_actions/user"

type Inputs = z.infer<typeof userSchema>

interface AddUserFormProps {
  actions: Pick<
    Action & { application: Pick<Application, "name"> },
    "id" | "name" | "application"
  >[]
}

export function AddUserForm({ actions }: AddUserFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [selectedActions, setSelectedActions] = React.useState<Option[] | null>(
    null
  )
  const form = useForm<Inputs>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      role: "user",
      actions: [],
    },
  })
  const formatedActions = actions.map<Option>((action) => ({
    value: action.id,
    label: `${action.name} (${action.application.name})`,
  }))

  function onSubmit(data: Inputs) {
    startTransition(async () => {
      try {
        await addUserAction(data)
        form.reset()
        toast.success("User added successfully")
        router.push("/dashboard/users")
        router.refresh()
      } catch (err) {
        if (isClerkAPIResponseError(err)) {
          catchClerkError(err)
        } else {
          catchError(err)
        }
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="user-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="*********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="*********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem
                className={cn("w-full", field.value === "user" && "sm:w-1/3")}
              >
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(profiles.role.enumValues).map((value) => (
                      <SelectItem
                        className="capitalize"
                        key={value}
                        value={value}
                      >
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("role") === "user" && (
            <FormField
              control={form.control}
              name="actions"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Actions</FormLabel>
                  <FormControl>
                    <MultiSelect
                      setSelected={setSelectedActions}
                      placeholder="Select Actions"
                      options={formatedActions}
                      selected={selectedActions}
                      onChange={(values) =>
                        field.onChange(values?.map((o) => ({ id: o.value })))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <div className="flex flex-col justify-end sm:flex-row">
          <Button disabled={isPending} type="submit">
            {isPending && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add
            <span className="sr-only">Add</span>
          </Button>
        </div>
      </form>
    </Form>
  )
}
