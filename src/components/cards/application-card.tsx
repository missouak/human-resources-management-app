import Link from "next/link"
import type { Application } from "@/db/schema"

import { getRandomPatternStyle } from "@/lib/generate-pattern"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StoreCardProps {
  application: Application
  href: string
}

export function ApplicationCard({ application, href }: StoreCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full overflow-hidden">
        <AspectRatio ratio={21 / 9}>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-zinc-950/20" />
          <div
            className="h-full rounded-t-md"
            style={getRandomPatternStyle(String(href))}
          />
        </AspectRatio>
        <CardHeader>
          <CardTitle className="line-clamp-1 text-lg">
            {application.name}
          </CardTitle>
          {application.description ? (
            <CardDescription className="line-clamp-2">
              {application.description}
            </CardDescription>
          ) : null}
        </CardHeader>
      </Card>
    </Link>
  )
}
