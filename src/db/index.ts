import { env } from "@/env.mjs"
// import { connect } from "@planetscale/database"
// import { drizzle } from "drizzle-orm/planetscale-serverless"

import { drizzle } from "drizzle-orm/mysql2"
import { createConnection } from "mysql2"

import * as schema from "./schema"

// PlanetScale
// Create the connection
// const connection = connect({
//   url: env.DATABASE_URL,
// })
// export const db = drizzle(connection, { schema })

// mysql2
const connection = createConnection(env.DATABASE_URL)
export const db = drizzle(connection, { schema, mode: "default" })
