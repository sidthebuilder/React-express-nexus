import { useProjects } from "@/hooks/use-projects";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";

export default function Projects() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">Projects</h1>
          <p className="text-muted-foreground">Manage and track your ongoing initiatives.</p>
        </div>
        <CreateProjectDialog />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="border-border/50 bg-card/50 h-[200px] flex flex-col justify-between p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="text-center py-24 bg-card/30 rounded-3xl border border-dashed border-border/50">
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Create your first project to get started.</p>
          <CreateProjectDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="group h-full flex flex-col border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {project.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 pb-4">
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary/70" />
                      <span>Started {format(new Date(project.createdAt || ""), 'MMM d, yyyy')}</span>
                    </div>
                    {project.dueDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary/70" />
                        <span>Due {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 border-t border-border/50 mt-auto p-4 bg-muted/20 group-hover:bg-primary/5 transition-colors">
                  <div className="w-full flex items-center justify-between text-sm font-medium">
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">View Details</span>
                    <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
