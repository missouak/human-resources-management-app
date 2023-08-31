"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Action } from "@prisma/client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddUserForm } from "@/components/forms/add-user-form"

interface AddUserDialogProps {
  actions: Omit<Action, "applicationId">[]
}

export default function AddUserDialog({ actions }: AddUserDialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(true)
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        router.back()
        setOpen(false)
      }}
    >
      <ScrollArea className="h-full flex-1">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>Add User</DialogDescription>
          </DialogHeader>
          <div>
            <AddUserForm actions={actions} />
          </div>
        </DialogContent>
      </ScrollArea>
    </Dialog>
  )
}
