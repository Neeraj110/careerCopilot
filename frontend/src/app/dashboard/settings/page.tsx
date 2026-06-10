"use client";

import { useAuth } from "@/hooks/use-auth";
import { User, Shield, Bell, CreditCard, Key } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50 backdrop-blur-sm p-1">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" /> <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account's profile information and email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={user?.email || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Headline</label>
                <Input placeholder="Frontend Engineer" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
              <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what updates you want to receive via email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Weekly digest", desc: "A summary of your ATS scores and roadmap progress.", checked: true },
                { title: "New AI features", desc: "Be the first to know when we add new AI capabilities.", checked: true },
                { title: "Security alerts", desc: "Important notifications about your account security.", checked: true, disabled: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <label className={`text-sm font-medium ${item.disabled ? 'text-muted-foreground' : ''}`}>{item.title}</label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  {/* Custom simple toggle switch for demonstration */}
                  <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${item.checked ? 'bg-primary' : 'bg-muted'} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${item.checked ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
           <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>You are currently on the Free plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">CareerPilot Free</h3>
                    <p className="text-sm text-muted-foreground">3 Resume scans/month, Basic AI chat.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">$0</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                </div>
                <Progress value={33} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">1 of 3 scans used this month. Resets on Nov 1.</p>
              </div>
              <Button className="mt-6">Upgrade to Pro</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
           <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for programmatic access.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border p-8 text-center bg-muted/20">
                 <Key className="mb-4 h-8 w-8 text-muted-foreground" />
                 <h3 className="text-lg font-medium">Developer Access</h3>
                 <p className="mt-2 text-sm text-muted-foreground max-w-sm mb-4">
                   API access is only available on the Pro plan. Upgrade to generate keys.
                 </p>
                 <Button variant="outline" disabled>Generate Key</Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
