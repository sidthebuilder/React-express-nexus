import { db } from "./db";
import {
  projects, tasks, activityLogs, users,
  type User,
  type Project, type InsertProject, type UpdateProjectRequest,
  type Task, type InsertTask, type UpdateTaskRequest,
  type ActivityLog
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: UpdateProjectRequest): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Tasks
  getTasks(projectId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Activity
  getRecentActivity(): Promise<(ActivityLog & { user: User | null })[]>;
  createActivityLog(log: { userId?: string; projectId?: number; action: string; details?: string }): Promise<void>;
  
  // User helper for seeding
  getUserByUsername(username: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Project methods
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, updates: UpdateProjectRequest): Promise<Project> {
    const [updated] = await db.update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    // Delete tasks first (cascade manually if not handled by DB)
    await db.delete(tasks).where(eq(tasks.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Task methods
  async getTasks(projectId?: number): Promise<Task[]> {
    if (projectId) {
      return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
    }
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task> {
    const [updated] = await db.update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Activity methods
  async getRecentActivity(): Promise<(ActivityLog & { user: User | null })[]> {
    // Use proper join instead of query builder if relation inference is tricky with multiple schema files
    // But relations should work if imported correctly
    return await db.query.activityLogs.findMany({
      orderBy: desc(activityLogs.createdAt),
      limit: 20,
      with: {
        user: true
      }
    });
  }

  async createActivityLog(log: { userId?: string; projectId?: number; action: string; details?: string }): Promise<void> {
    await db.insert(activityLogs).values(log);
  }

  // User helper
  async getUserByUsername(username: string): Promise<User | undefined> {
    // This assumes username exists on User model which it might not if it's from auth.ts (it has email, not username?)
    // auth.ts has: email, firstName, lastName. No username.
    // So we should check by email or just return first user.
    const [user] = await db.select().from(users).limit(1);
    return user;
  }
}

export const storage = new DatabaseStorage();
