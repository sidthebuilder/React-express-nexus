import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useActivity } from "@/hooks/use-activity";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  FolderKanban
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: activity, isLoading: activityLoading } = useActivity();

  // Metrics Logic
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
  const pendingTasks = tasks?.filter(t => t.status !== 'done').length || 0;
  const highPriorityTasks = tasks?.filter(t => t.priority === 'high' && t.status !== 'done').length || 0;

  // Chart Data Logic
  const projectProgressData = projects?.map(project => {
    const projectTasks = tasks?.filter(t => t.projectId === project.id) || [];
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const total = projectTasks.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { name: project.name, progress };
  }).slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-display tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          icon={FolderKanban}
          trend="+12%"
          isLoading={projectsLoading}
          color="text-blue-500"
        />
        <StatsCard
          title="Tasks Completed"
          value={completedTasks}
          icon={CheckCircle2}
          trend="+5%"
          isLoading={tasksLoading}
          color="text-green-500"
        />
        <StatsCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={Clock}
          trend="-2%"
          isLoading={tasksLoading}
          color="text-orange-500"
        />
        <StatsCard
          title="High Priority"
          value={highPriorityTasks}
          icon={AlertCircle}
          trend="Action needed"
          isLoading={tasksLoading}
          color="text-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Completion rate by top projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {projectsLoading || tasksLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : projectProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectProgressData} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    />
                    <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={32}>
                      {projectProgressData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No project data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 relative">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-6">
                {activityLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-2 h-2 mt-2 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : activity?.length ? (
                  activity.map((log) => (
                    <div key={log.id} className="relative pl-6 pb-1 last:pb-0 group">
                      <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      <div className="absolute left-[3.5px] top-4 bottom-0 w-[1px] bg-border last:hidden" />
                      <div className="space-y-1">
                        <p className="text-sm text-foreground font-medium leading-none">
                          {//@ts-ignore
                            log.user?.username || "System"} <span className="text-muted-foreground font-normal">{log.action.replace('_', ' ')}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.details || "Updated a task"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold pt-1">
                          {formatDistanceToNow(new Date(log.createdAt || ""), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No recent activity
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, isLoading, color }: any) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-border transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-lg bg-background/50 border border-border group-hover:border-${color.split('-')[1]}-500/30 transition-colors`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
        <div className="space-y-1">
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <h2 className="text-3xl font-bold tracking-tight text-white">{value}</h2>
          )}
          <div className="flex items-center text-xs text-muted-foreground">
            {trend.includes('+') ? (
              <span className="text-green-500 font-medium flex items-center mr-2">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {trend}
              </span>
            ) : (
              <span className="text-muted-foreground font-medium mr-2">{trend}</span>
            )}
            <span>from last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
