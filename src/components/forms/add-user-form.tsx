"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Option } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Action } from "@prisma/client"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { userSchema } from "@/lib/validations/user"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"

import { MultiSelect } from "../mutli-select"
import { PasswordInput } from "../password-input"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

type Inputs = z.infer<typeof userSchema>

interface AddUserFormProps {
  actions: Omit<Action, "applicationId">[]
}

const role = ["user", "admin", "superAdmin"]

export function AddUserForm({ actions }: AddUserFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [selectedActions, setSelectedActions] = React.useState<Option[] | null>(
    null
  )
  const formatedActions = actions.map<Option>((action) => ({
    value: action.id,
    label: action.name,
  }))
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

  React.useEffect(() => {
    form.setValue("actions", selectedActions ?? [])
  }, [selectedActions])

  function onSubmit(data: Inputs) {
    console.log(data)
  }
  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={(...args) => form.handleSubmit(onSubmit)(...args)}
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
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {role.map((item) => (
                    <SelectItem key={item} value={item}>
                      {String(item[0].toUpperCase() + item.slice(1))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="actions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actions</FormLabel>
              <FormControl>
                <MultiSelect
                  setSelected={setSelectedActions}
                  placeholder="Select Actions"
                  options={formatedActions}
                  selected={field.value}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end">
          <Button type="submit">Add</Button>
        </div>
      </form>
    </Form>
  )
}
