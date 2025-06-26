import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }).notNull(),
  durationEstimateMinutes: integer("duration_estimate_minutes").notNull(),
  status: text("status", { enum: ["pending", "completed", "missed"] })
    .notNull()
    .default("pending"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  parentTaskTitle: varchar("parent_task_title", { length: 256 }),
  isFirstOfParent: boolean("is_first_of_parent").default(false),
  sortOrder: integer("sort_order").notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(user, {
    fields: [tasks.userId],
    references: [user.id],
  }),
}));
