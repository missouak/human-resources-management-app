"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { employees, type Department, type Service } from "@/db/schema"
import type { FileWithPreview, StoredFile } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { SelectValue } from "@radix-ui/react-select"
import { generateReactHelpers } from "@uploadthing/react/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { catchError, isArrayOfFile } from "@/lib/utils"
import { employeeSchema } from "@/lib/validations/employee"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  UncontrolledFormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileDialog } from "@/components/file-dialog"
import { Icons } from "@/components/icons"
import { Zoom } from "@/components/zoom-image"
import { addEmployeeAction } from "@/app/_actions/employee"
import { type OurFileRouter } from "@/app/api/uploadthing/core"

interface AddEmployeeFormProps {
  departments: Department[]
  services: Service[]
  redirectLink: string
}

type Inputs = z.infer<typeof employeeSchema>

const { useUploadThing } = generateReactHelpers<OurFileRouter>()

export function AddEmployeeForm({
  departments,
  services,
  redirectLink,
}: AddEmployeeFormProps) {
  const [files, setFiles] = React.useState<FileWithPreview[] | null>(null)

  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { isUploading, startUpload } = useUploadThing("emplyoyeeImage")

  const form = useForm<Inputs>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      gender: "male",
      maritalStatus: "single",
    },
  })

  function onSubmit(data: Inputs) {
    startTransition(async () => {
      try {
        const image = isArrayOfFile(data.image)
          ? await startUpload(data.image).then((res) => {
              const urls = res?.map<StoredFile>((image) => ({
                id: image.key,
                name: image.name,
                url: image.url,
              }))
              return urls ?? null
            })
          : null

        await addEmployeeAction({
          ...data,
          image: image,
          revalidateLink: redirectLink,
        })

        toast.success("Employee added successfully.")

        form.reset()
        setFiles(null)
      } catch (err) {
        catchError(err)
      }
    })
  }

  const departmentId =
    searchParams?.get("departmentId") ?? departments[0]?.id ?? null

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  React.useEffect(() => {
    router.push(`${pathname}?${createQueryString({ departmentId })}`)
  }, [])

  return (
    <Form {...form}>
      <form
        className="w-full max-w-2xl"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <Accordion
          type="single"
          defaultValue="personal-data"
          collapsible
          className="w-full"
        >
          <AccordionItem value="personal-data">
            <AccordionTrigger>Personal informations</AccordionTrigger>
            <AccordionContent className="overflow-visible pl-3 pt-3">
              <div className="grid gap-5">
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="First name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="cin"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Cin</FormLabel>
                        <FormControl>
                          <Input placeholder="Cin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="test@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input placeholder="0612345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Date of birth</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Gender</FormLabel>
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="capitalize">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(employees.gender.enumValues).map(
                              (value) => {
                                return (
                                  <SelectItem
                                    className="capitalize"
                                    key={value}
                                    value={value}
                                  >
                                    {value}
                                  </SelectItem>
                                )
                              }
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Marital status</FormLabel>
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="capitalize">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(
                              employees.maritalStatus.enumValues
                            ).map((value) => {
                              return (
                                <SelectItem
                                  className="capitalize"
                                  key={value}
                                  value={value}
                                >
                                  {value}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <Textarea placeholder="Address" {...field} />
                    </FormItem>
                  )}
                />
                <FormItem className="flex w-full flex-col gap-1.5">
                  {files?.length ? (
                    <div className="flex items-center gap-2">
                      {files.map((file, i) => (
                        <Zoom key={i}>
                          <Image
                            src={file.preview}
                            alt={file.name}
                            className="h-20 w-20 shrink-0 rounded-md object-cover object-center"
                            width={80}
                            height={80}
                          />
                        </Zoom>
                      ))}
                    </div>
                  ) : null}
                  <FormControl>
                    <FileDialog
                      title="Upload Employee Image"
                      name="image"
                      revokePreviewOnUnmount={false}
                      setValue={form.setValue}
                      maxSize={1024 * 1024 * 1}
                      files={files}
                      setFiles={setFiles}
                      isUploading={isUploading}
                      disabled={isPending}
                    />
                  </FormControl>
                  <UncontrolledFormMessage
                    message={form.formState.errors.image?.message}
                  />
                </FormItem>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="work-data">
            <AccordionTrigger>Work informations</AccordionTrigger>
            <AccordionContent className="overflow-visible pl-3 pt-3">
              <div className="grid gap-5">
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Job title</FormLabel>
                        <Input placeholder="Job title" {...field} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="joinedAt"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Joined at</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="rib"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>RIB</FormLabel>
                        <Input placeholder="Rib" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>IBAN</FormLabel>
                        <Input placeholder="Iban" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col items-start gap-4 sm:flex-row">
                  <FormItem className="w-full">
                    <FormLabel>Department</FormLabel>
                    <Select
                      defaultValue={departments[0]?.id}
                      onValueChange={(value) =>
                        router.push(
                          `${pathname}?${createQueryString({
                            departmentId: value,
                          })}`
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Service</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex flex-col justify-start gap-3 pt-4 sm:flex-row">
          <Button size="lg" disabled={isPending} type="submit">
            {isPending && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add
            <span className="sr-only">Add</span>
          </Button>
          <Button
            disabled={isPending}
            variant="secondary"
            size="lg"
            onClick={() => router.push(redirectLink)}
            type="button"
          >
            Cancel
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      </form>
    </Form>
  )
}
