import { useTasks } from "@/hooks/use-tasks";
import { CreateTaskDialog } from "@/components/CreateTaskDialog"; // Note: this dialog currently requires projectId
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const { data: projects } = useProjects(); // Fetch projects to map names

  // Group tasks if needed or just show list
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">All Tasks</h1>
          <p className="text-muted-foreground">A unified view of work across all projects.</p>
        </div>
        {/* We can't easily add a global "Create Task" without selecting a project first. 
            For now, we omit the button here or it would need a project selector. */}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : tasks?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No tasks found.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {tasks?.map((task) => {
                const project = projects?.find(p => p.id === task.projectId);
                return (
                  <div key={task.id} className="py-4 flex items-center justify-between group hover:bg-muted/30 px-4 -mx-4 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {task.status === 'done' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {project && (
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-primary/20 text-primary bg-primary/5">
                              {project.name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground capitalize">{task.status?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <Badge variant="outline" className={`capitalize ${
                         task.priority === 'high' ? 'border-red-500/30 text-red-500' : 
                         task.priority === 'medium' ? 'border-blue-500/30 text-blue-500' : 
                         'border-slate-500/30 text-slate-500'
                       }`}>
                         {task.priority}
                       </Badge>
                       {task.dueDate && (
                         <div className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-[80px] justify-end">
                           <Clock className="w-3.5 h-3.5" />
                           {format(new Date(task.dueDate), 'MMM d')}
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
