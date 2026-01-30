import { useRoute } from "wouter";
import { useProject } from "@/hooks/use-projects";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCorners } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useMemo } from "react";
import { GripVertical, MoreVertical, Calendar } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500/20 text-slate-200' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500/20 text-blue-200' },
  { id: 'review', title: 'Review', color: 'bg-purple-500/20 text-purple-200' },
  { id: 'done', title: 'Done', color: 'bg-green-500/20 text-green-200' },
];

export default function ProjectDetails() {
  const [match, params] = useRoute("/projects/:id");
  const projectId = parseInt(params?.id || "0");
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);
  const { mutate: updateTask } = useUpdateTask();

  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, typeof tasks> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    tasks.forEach((task) => {
      if (grouped[task.status || 'todo']) {
        grouped[task.status || 'todo'].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overId = over.id;

    // Find if dropped over a container (column) or another item
    let newStatus = overId;

    // If overId is a number, it's a task ID. Find its status.
    if (typeof overId === 'number') {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (activeTask && activeTask.status !== newStatus && COLUMNS.some(c => c.id === newStatus)) {
      updateTask({ id: activeTask.id, status: newStatus });
    }
  };

  if (projectLoading || tasksLoading) {
    return <div className="p-8 space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-4 gap-4 mt-8">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[500px] w-full" />)}
      </div>
    </div>;
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-display tracking-tight text-white">{project.name}</h1>
            <Badge variant={project.status === 'active' ? 'default' : 'outline'} className="capitalize">
              {project.status?.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl truncate">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateTaskDialog projectId={projectId} />
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col h-full bg-muted/20 rounded-xl border border-border/50 p-3">
              <div className={`flex items-center justify-between px-3 py-3 mb-3 rounded-lg ${column.color}`}>
                <span className="font-semibold text-sm">{column.title}</span>
                <span className="text-xs font-bold bg-background/20 px-2 py-0.5 rounded-full">
                  {tasksByStatus[column.id].length}
                </span>
              </div>

              <SortableContext
                items={tasksByStatus[column.id].map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 space-y-3 overflow-y-auto px-1 min-h-[100px]">
                  {tasksByStatus[column.id].map((task) => (
                    <SortableTaskItem key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <TaskCard task={tasks.find(t => t.id === activeId)!} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SortableTaskItem({ task }: { task: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task, isOverlay }: { task: any, isOverlay?: boolean }) {
  // Note: Hooks in components inside map is okay if component is stable.
  // Ideally pass handlers down, but for now fixed import.

  const priorityColor = {
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
  }[task.priority as string] || 'bg-slate-500/10';

  return (
    <Card className={`
      border border-border/50 bg-card hover:border-primary/50 transition-all duration-200 cursor-grab active:cursor-grabbing
      ${isOverlay ? 'shadow-2xl rotate-2 scale-105 border-primary' : 'shadow-sm hover:shadow-md'}
    `}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider h-5 px-1.5 border ${priorityColor}`}>
            {task.priority}
          </Badge>
          <GripVertical className="w-4 h-4 text-muted-foreground/30" />
        </div>

        <div>
          <h4 className="text-sm font-semibold leading-tight text-foreground">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
