import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Shield } from "lucide-react";

// Mock data since we don't have a full users list endpoint yet (only /api/auth/user)
const TEAM_MEMBERS = [
  { id: 1, name: "Alex Rivers", role: "Admin", email: "alex@nexus.com", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
  { id: 2, name: "Sarah Chen", role: "Manager", email: "sarah@nexus.com", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: 3, name: "Mike Ross", role: "Developer", email: "mike@nexus.com", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" },
  { id: 4, name: "Emma Wilson", role: "Designer", email: "emma@nexus.com", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
];

export default function Team() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-display tracking-tight text-white">Team Members</h1>
        <p className="text-muted-foreground">Collaborate and manage permissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map((member) => (
          <Card key={member.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Avatar className="w-16 h-16 border-2 border-border/50">
                  {/* <!-- team member headshot --> */}
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                  {member.role}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  {member.email}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <div className="flex-1 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[75%]" />
                </div>
                <span className="text-xs text-muted-foreground">High Activity</span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add Member Card */}
        <Card className="border-border/50 bg-muted/20 border-dashed hover:bg-muted/40 transition-all duration-300 cursor-pointer flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium">Invite Member</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
