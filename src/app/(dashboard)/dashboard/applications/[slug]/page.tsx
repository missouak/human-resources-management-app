import { type Metadata } from "next"
import { revalidatePath } from "next/cache"
import { notFound } from "next/navigation"
import { env } from "@/env.mjs"

import { prisma } from "@/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingButton } from "@/components/loading-button"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Manage Store",
  description: "Manage your store",
}

interface UpdateStorePageProps {
  params: {
    slug: string
  }
}

export default async function UpdateStorePage({
  params,
}: UpdateStorePageProps) {
  const appSlug = params.slug

  async function updateApp(fd: FormData) {
    "use server"

    const name = fd.get("name") as string
    const description = fd.get("description") as string

    const appWithSameName = await prisma.application.findFirst({
      where: {
        AND: {
          name: name,
          NOT: {
            slug: appSlug,
          },
        },
      },
      select: {
        id: true,
      },
    })

    if (appWithSameName) {
      throw new Error("Application name already taken")
    }

    await prisma.application.update({
      where: {
        slug: appSlug,
      },
      data: {
        name: name,
        description: description,
      },
    })

    revalidatePath(`/dashboard/applications/${appSlug}`)
  }

  const app = await prisma.application.findFirst({
    where: {
      slug: appSlug,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  })

  if (!app) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Card
        as="section"
        id="update-application"
        aria-labelledby="update-application-heading"
      >
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Update your application</CardTitle>
          <CardDescription>
            Update your application name and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            action={updateApp}
            className="grid w-full max-w-xl gap-5"
          >
            <fieldset className="grid gap-2.5">
              <Label htmlFor="update-application-name">Name</Label>
              <Input
                id="update-application-name"
                aria-describedby="update-application-name-description"
                name="name"
                required
                minLength={3}
                maxLength={50}
                placeholder="Type application name here."
                defaultValue={app.name}
              />
            </fieldset>
            <fieldset className="grid gap-2.5">
              <Label htmlFor="update-application-description">
                Description
              </Label>
              <Textarea
                id="update-application-description"
                aria-describedby="update-application-description-description"
                name="description"
                minLength={3}
                maxLength={255}
                placeholder="Type application description here."
                defaultValue={app.description ?? ""}
              />
            </fieldset>
            <div className="flex flex-col gap-2 sm:flex-row">
              <LoadingButton>
                Update application
                <span className="sr-only">Update application</span>
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
