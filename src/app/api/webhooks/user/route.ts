import { headers } from "next/headers"
import { db } from "@/db"
import { actionsToProfiles, profiles } from "@/db/schema"
import { WebhookEvent } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { Webhook } from "svix"

import { userPrivateMetadataSchema } from "@/lib/validations/auth"

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
  // Get the event type
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, username, image_url, private_metadata } = evt.data
    const userPrivateMetadata =
      userPrivateMetadataSchema.parse(private_metadata)
    await db.insert(profiles).values({
      userId: id,
      username: username!,
      imageUrl: image_url,
      role: userPrivateMetadata.role,
    })
    await db.insert(actionsToProfiles).values(
      userPrivateMetadata.actions
        ? userPrivateMetadata.actions.map((action) => ({
            profileId: id,
            actionId: action.id,
          }))
        : []
    )
  }

  if (eventType === "user.updated") {
    const {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      image_url: imageUrl,
      username,
      email_addresses,
    } = evt.data

    await db
      .update(profiles)
      .set({
        email: email_addresses[0]?.email_address,
        username: username!,
        firstName,
        lastName,
        imageUrl,
      })
      .where(eq(profiles.userId, userId))
  }
  if (eventType === "user.deleted") {
    const { id } = evt.data
    if (id) {
      await db.delete(profiles).where(eq(profiles.userId, id))
      await db
        .delete(actionsToProfiles)
        .where(eq(actionsToProfiles.profileId, id))
    }
  }

  return new Response("Success", { status: 200 })
}
