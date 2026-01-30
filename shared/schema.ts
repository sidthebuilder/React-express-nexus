import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "./models/auth";
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const projects = sqliteTable("projects", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active"), // active, archived, completed
  ownerId: integer("owner_id").references(() => users.id),
  startDate: integer("start_date", { mode: "timestamp" }).default(sql`(unixepoch())`),
  dueDate: integer("due_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("todo"), // todo, in_progress, review, done
  priority: text("priority").default("medium"), // low, medium, high
  assigneeId: integer("assignee_id").references(() => users.id),
  dueDate: integer("due_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  action: text("action").notNull(), // e.g., "created_task", "updated_status"
  details: text("details"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  tasks: many(tasks),
  activityLogs: many(activityLogs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
  activityLogs: many(activityLogs),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [activityLogs.projectId],
    references: [projects.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;

// Request/Response Types
export type CreateProjectRequest = InsertProject;
export type UpdateProjectRequest = Partial<InsertProject>;

export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;

// Responses with relations
// User type is imported from auth.ts
import type { User } from "./models/auth";

export type ProjectWithDetails = Project & {
  owner?: User | null;
  tasks?: Task[];
};

export type TaskWithDetails = Task & {
  assignee?: User | null;
  project?: Project | null;
};
