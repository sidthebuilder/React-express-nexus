import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateTaskRequest, type UpdateTaskRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useTasks(projectId?: number) {
  return useQuery({
    queryKey: [api.tasks.list.path, projectId],
    queryFn: async () => {
      const url = projectId
        ? `${api.tasks.list.path}?projectId=${projectId}`
        : api.tasks.list.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return api.tasks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      // Coerce numeric fields if coming from form strings
      const extendedSchema = api.tasks.create.input.extend({
        projectId: z.coerce.number(),
        assigneeId: z.coerce.number().optional(),
      });
      const validated = extendedSchema.parse(data);

      const res = await fetch(api.tasks.create.path, {
        method: api.tasks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.tasks.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create task");
      }
      return api.tasks.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, variables.projectId] });
      toast({ title: "Success", description: "Task created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateTaskRequest) => {
      const validated = api.tasks.update.input.parse(updates);
      const url = buildUrl(api.tasks.update.path, { id });

      const res = await fetch(url, {
        method: api.tasks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update task");
      return api.tasks.update.responses[200].parse(await res.json());
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      if (updatedTask.projectId) {
        queryClient.invalidateQueries({ queryKey: [api.projects.get.path, updatedTask.projectId] });
      }
    },
    // No toast on success to avoid spamming during drag-and-drop
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, { method: api.tasks.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      // We'd ideally invalidate the specific project too, but we don't know the ID here easily without extra state
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path] });
      toast({ title: "Deleted", description: "Task deleted successfully" });
    },
  });
}
