import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heading } from "@/components/heading"
import { Icons } from "@/components/icons"
import { Shell } from "@/components/shells/shell"

interface AppAnalyticsPageProps {
  params: {
    slug: string
  }
}

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function AppAnalyticsPage({
  params,
}: AppAnalyticsPageProps) {
  return <div>Application analytics</div>
}
