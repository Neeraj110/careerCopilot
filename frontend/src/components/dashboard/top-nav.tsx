"use client";

import { Bell, Search, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        {/* Search Bar Placeholder */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search documents, chats, skills..."
            className="h-9 w-full rounded-md border border-border bg-muted/50 pl-9 pr-4 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-danger"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`} alt={user?.email || "User avatar"} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {user?.email ? user.email.split('@')[0] : 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-danger focus:bg-danger-muted focus:text-danger">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
