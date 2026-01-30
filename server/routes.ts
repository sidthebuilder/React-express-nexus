import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);

  // Projects
  app.get(api.projects.list.path, async (req, res) => {
    // In a real app, filter by user or role
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const id = parseInt(req.params.id as string);
    const project = await storage.getProject(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Also fetch tasks for the project details view
    const tasks = await storage.getTasks(id);
    res.json({ ...project, tasks });
  });

  app.post(api.projects.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const data = api.projects.create.input.parse(req.body);
      const project = await storage.createProject({
        ...data,
        ownerId: req.user!.id
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        projectId: project.id,
        action: "created_project",
        details: `Created project: ${project.name}`
      });

      res.status(201).json(project);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch(api.projects.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id as string);
      const data = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(id, data);

      await storage.createActivityLog({
        userId: req.user!.id,
        projectId: project.id,
        action: "updated_project",
        details: `Updated project: ${project.name}`
      });

      res.json(project);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.sendStatus(404);
      }
    }
  });

  app.delete(api.projects.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id as string);
      await storage.deleteProject(id);
      res.sendStatus(204);
    } catch (e) {
      res.sendStatus(404);
    }
  });

  // Tasks
  app.get(api.tasks.list.path, async (req, res) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    const tasks = await storage.getTasks(projectId);
    res.json(tasks);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const data = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask({
        ...data,
        assigneeId: req.user!.id
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        projectId: task.projectId,
        action: "created_task",
        details: `Created task: ${task.title}`
      });

      res.status(201).json(task);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch(api.tasks.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id as string);
      const data = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(id, data);

      // Log status changes
      if (data.status) {
        await storage.createActivityLog({
          userId: req.user!.id,
          projectId: task.projectId,
          action: "updated_task_status",
          details: `Moved task '${task.title}' to ${data.status}`
        });
      }

      res.json(task);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.sendStatus(404);
      }
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id as string);
      await storage.deleteTask(id);
      res.sendStatus(204);
    } catch (e) {
      res.sendStatus(404);
    }
  });

  // Activity
  app.get(api.activity.list.path, async (req, res) => {
    const activity = await storage.getRecentActivity();
    res.json(activity);
  });

  return httpServer;
}
