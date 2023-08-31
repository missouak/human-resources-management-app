"use client"

import * as React from "react"

import { Button, ButtonProps } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ConfirmDialogProps extends ButtonProps {
  onConfirm: React.MouseEventHandler<HTMLButtonElement>
}

export function ConfirmDialog({ onConfirm, ...props }: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...props} disabled={undefined} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure ?</DialogTitle>
          <DialogDescription>This action can not be undone.</DialogDescription>
        </DialogHeader>
        <div className="flex w-full items-center justify-end space-x-2 pt-6">
          <Button
            variant="outline"
            disabled={props.disabled}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={props.disabled}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
