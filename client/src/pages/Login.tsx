import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hexagon, ArrowRight, ShieldCheck, Zap, Globe, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Login() {
  const { user, login, isLoggingIn } = useAuth();
  const [_, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

      {/* Nav */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Hexagon className="w-6 h-6 text-primary fill-primary/20" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight">Nexus</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10">
        <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-[1.1] tracking-tight text-white">
            Manage projects with <span className="text-gradient-primary">precision</span>.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
            The enterprise-grade platform for modern teams. Streamline workflows, track progress, and ship faster than ever before.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5" onClick={() => document.getElementById('login-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Enterprise Security
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Real-time Sync
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Global CDN
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div id="login-form" className="flex-1 w-full max-w-md">
          <Card className="glass-card border-white/10 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Sign in to access your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 border-white/10 focus:border-primary/50"
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-base font-medium mt-2" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Demo credentials: admin / admin123
                </p>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                By clicking sign in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-white/5 text-center text-sm text-muted-foreground relative z-10">
        <p>&copy; {new Date().getFullYear()} Nexus Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
