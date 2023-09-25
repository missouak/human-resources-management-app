import { StoredFile } from "@/types"
import { relations, sql } from "drizzle-orm"
import {
  date,
  index,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core"

export const applications = mysqlTable(
  "applications",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .default(sql`(uuid())`),
    name: varchar("name", { length: 191 }).notNull().unique(),
    description: text("description"),
    slug: text("slug"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (table) => ({
    id_Idx: index("applications_id_Idx").on(table.id),
  })
)

export type Application = typeof applications.$inferSelect

export const applicationsRelations = relations(applications, ({ many }) => ({
  actions: many(actions),
}))

export const actions = mysqlTable(
  "actions",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .default(sql`(uuid())`),
    name: varchar("name", { length: 191 }).notNull(),
    description: text("description"),
    slug: text("slug"),
    applicationId: varchar("applicationId", { length: 191 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (table) => ({
    id_Idx: index("actions_id_Idx").on(table.id),
    name_Idx: index("actions_name_Idx").on(table.name),
    applicationId_Idx: index("actions_applicationId_Idx").on(
      table.applicationId
    ),
  })
)

export type Action = typeof actions.$inferSelect

export const actionsRelations = relations(actions, ({ many, one }) => ({
  application: one(applications, {
    fields: [actions.applicationId],
    references: [applications.id],
  }),
  users: many(actionsToProfiles),
}))

export const profiles = mysqlTable(
  "profiles",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .default(sql`(uuid())`),
    userId: varchar("userId", { length: 191 }).notNull().unique(),
    username: varchar("username", { length: 191 }).notNull(),
    imageUrl: text("imageUrl").notNull(),
    email: text("email"),
    firstName: varchar("firstName", { length: 191 }),
    lastName: varchar("lastName", { length: 191 }),
    role: mysqlEnum("role", ["user", "admin"]).notNull().default("user"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (table) => ({
    id_Idx: index("profiles_id_Idx").on(table.id),
    userId_Idx: index("profiles_userId_Idx").on(table.userId),
    username_Idx: index("profiles_username_Idx").on(table.username),
  })
)

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert

export const profilesRelations = relations(profiles, ({ many }) => ({
  actions: many(actionsToProfiles),
}))

export const actionsToProfiles = mysqlTable(
  "actions_to_profiles",
  {
    actionId: varchar("actionId", { length: 191 }),
    profileId: varchar("profileId", { length: 191 }),
  },
  (table) => ({
    pk: primaryKey(table.actionId, table.profileId),
    actionId_Idx: index("actionToProfiles_actionId_Idx").on(table.actionId),
    profileId_Idx: index("actionToProfiles_profileId_Idx").on(table.profileId),
  })
)

export const actionsToProfilesRelations = relations(
  actionsToProfiles,
  ({ one }) => ({
    action: one(actions, {
      fields: [actionsToProfiles.actionId],
      references: [actions.id],
    }),
    profile: one(profiles, {
      fields: [actionsToProfiles.profileId],
      references: [profiles.userId],
    }),
  })
)

export const departments = mysqlTable(
  "departments",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .default(sql`(uuid())`),
    name: varchar("name", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (table) => ({
    id_Idx: index("departments_id_Idx").on(table.id),
    name_Idx: index("departments_name_Idx").on(table.name),
  })
)

export type Department = typeof departments.$inferSelect
export type NewDepartment = typeof departments.$inferInsert

export const departmentsRealtions = relations(departments, ({ many }) => ({
  services: many(services),
}))

export const services = mysqlTable(
  "services",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .default(sql`(uuid())`),
    name: varchar("name", { length: 255 }).notNull(),
    departmentId: varchar("departmentId", { length: 191 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (table) => ({
    id_Idx: index("services_id_Idx").on(table.id),
    name_Idx: index("services_name_Idx").on(table.name),
    departmentId_Idx: index("services_departmentId_Idx").on(table.departmentId),
  })
)

export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert

export const servicesRelations = relations(services, ({ many, one }) => ({
  department: one(departments, {
    fields: [services.departmentId],
    references: [departments.id],
  }),
  employees: many(employees),
}))

export const employees = mysqlTable(
  "employees",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .default(sql`(uuid())`),
    firstName: varchar("firstName", { length: 191 }).notNull(),
    lastName: varchar("lastName", { length: 191 }).notNull(),
    cin: varchar("cin", { length: 191 }).notNull().unique(),
    gender: mysqlEnum("gender", ["male", "female"]).notNull().default("male"),
    phoneNumber: varchar("phoneNumber", { length: 191 }).notNull(),
    email: text("email").notNull(),
    address: text("address").notNull(),
    birthday: date("birthday").notNull(),
    maritalStatus: mysqlEnum("maritalStatus", [
      "single",
      "married",
      "widowed",
      "divorced",
    ])
      .notNull()
      .default("single"),
    image: json("image").$type<StoredFile[] | null>().default(null),
    iban: varchar("iban", { length: 191 }).notNull(),
    rib: varchar("rib", { length: 191 }).notNull(),
    joinedAt: date("joinedAt").notNull(),
    jobTitle: text("jobTitle").notNull(),
    serviceId: varchar("serviceId", { length: 191 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (table) => ({
    id_Idx: index("employees_id_Idx").on(table.id),
    cin_Idx: index("employees_cin_Idx").on(table.cin),
    serviceId_Idx: index("employees_serviceId_Idx").on(table.serviceId),
  })
)

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert

export const employeesRelations = relations(employees, ({ one }) => ({
  service: one(services, {
    fields: [employees.serviceId],
    references: [services.id],
  }),
}))
