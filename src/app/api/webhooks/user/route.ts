import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { Role } from "@prisma/client"
import { Webhook } from "svix"

import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    )
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new SVIX instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }
  type PrivateMetadata = {
    role: Role
    actions: { id: string }[]
  }
  // Get the event type
  const eventType = evt.type

  switch (eventType) {
    case "user.created":
    case "user.updated": {
      await prisma.profile.upsert({
        where: {
          userId: evt.data.id,
        },
        create: {
          userId: evt.data.id,
          username: evt.data.username!,
          role: evt.data.private_metadata.role as PrivateMetadata["role"],
          imageUrl: evt.data.image_url,
          actions: {
            connect: evt.data.private_metadata
              .actions as PrivateMetadata["actions"],
          },
        },
        update: {
          email: evt.data.email_addresses[0]?.email_address,
          imageUrl: evt.data.image_url,
          username: evt.data.username!,
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          actions: {
            set: evt.data.private_metadata
              .actions as PrivateMetadata["actions"],
          },
        },
      })
      break
    }
    case "user.deleted": {
      await prisma.profile.delete({
        where: {
          userId: evt.data.id,
        },
      })
    }
    default: {
      console.error("Error")
    }
  }

  return new Response("Success", { status: 200 })
}
