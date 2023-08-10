import { env } from "@/env.mjs"
import { Role } from "@prisma/client"
import bcrypt from "bcrypt"
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { prisma } from "@/lib/db"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      username: string
      role: Role
      image?: string | null
    }
  }

  interface User {
    username: string
    role: Role
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: Role
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "UserName", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null
        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
        })
        if (!user) throw new Error("user not found!")
        const checkPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!checkPassword)
          throw new Error("Username or password are incorrect!")
        return user
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.username = token.username
        session.user.image = token.picture
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
}

export const getServerAuthSession = async () => {
  const session = await getServerSession(authOptions)
  return session === null
    ? null
    : {
        ...session,
        user: {
          id: session.user.id,
          username: session.user.username,
          role: session.user.role,
          image: session.user.image ?? null,
        },
      }
}
